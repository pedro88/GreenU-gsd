import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/conversations
 * List all conversations for the authenticated user
 * Returns conversations sorted by last message (most recent first)
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId: session.user.id } },
      },
      include: {
        garden: { select: { id: true, name: true } },
        participants: {
          include: {
            user: { select: { id: true, name: true, email: true, image: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Build preview list
    const inbox = conversations.map((conv) => {
      const lastMessage = conv.messages[0];
      const otherParticipants = conv.participants
        .filter((p) => p.userId !== session.user.id)
        .map((p) => p.user);

      return {
        id: conv.id,
        garden: conv.garden,
        participants: conv.participants.map((p) => ({
          id: p.user.id,
          name: p.user.name,
          email: p.user.email,
          image: p.user.image,
        })),
        otherParticipants,
        lastMessage: lastMessage
          ? {
              id: lastMessage.id,
              content: lastMessage.content.length > 80
                ? lastMessage.content.slice(0, 80) + '...'
                : lastMessage.content,
              senderId: lastMessage.senderId,
              senderName: lastMessage.sender.name,
              createdAt: lastMessage.createdAt,
            }
          : null,
        updatedAt: conv.updatedAt,
        participantCount: conv.participants.length,
      };
    });

    return NextResponse.json(inbox);
  } catch (error) {
    console.error('Failed to list conversations:', error);
    return NextResponse.json({ error: 'Failed to list conversations' }, { status: 500 });
  }
}

const createConversationSchema = z.object({
  participantIds: z.array(z.string()).min(1),
  gardenId: z.string().optional(),
  initialMessage: z.string().min(1).max(2000).optional(),
});

/**
 * POST /api/conversations
 * Create a new conversation or return existing one with the same participants
 * Body: { participantIds: string[], gardenId?: string, initialMessage?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createConversationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { participantIds, gardenId, initialMessage } = validation.data;

    // Ensure current user is included
    const allParticipantIds = Array.from(new Set([session.user.id, ...participantIds]));

    // Verify all participants exist
    const users = await prisma.user.findMany({
      where: { id: { in: allParticipantIds } },
      select: { id: true },
    });
    if (users.length !== allParticipantIds.length) {
      return NextResponse.json({ error: 'One or more participants not found' }, { status: 400 });
    }

    // If gardenId provided, verify user has access to it
    if (gardenId) {
      const garden = await prisma.garden.findFirst({
        where: {
          id: gardenId,
          OR: [
            { userId: session.user.id },
            { collaborators: { some: { userId: session.user.id } } },
          ],
        },
      });
      if (!garden) {
        return NextResponse.json({ error: 'Garden not found or not accessible' }, { status: 403 });
      }
    }

    // Check for existing conversation with the same participants (same set, regardless of order)
    const existingConversations = await prisma.conversation.findMany({
      where: {
        gardenId: gardenId ?? null,
        participants: {
          every: { userId: { in: allParticipantIds } },
        },
      },
      include: {
        participants: { select: { userId: true } },
      },
    });

    // Filter to conversations with exactly the same participants
    const exactMatch = existingConversations.find(
      (c) =>
        c.participants.length === allParticipantIds.length &&
        c.participants.every((p) => allParticipantIds.includes(p.userId))
    );

    if (exactMatch) {
      // Return existing conversation
      const conversation = await prisma.conversation.findUnique({
        where: { id: exactMatch.id },
        include: {
          garden: { select: { id: true, name: true } },
          participants: {
            include: { user: { select: { id: true, name: true, email: true, image: true } } },
          },
        },
      });
      return NextResponse.json({ ...conversation, isNew: false });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        gardenId: gardenId ?? null,
        participants: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
        ...(initialMessage && {
          messages: {
            create: {
              senderId: session.user.id,
              content: initialMessage,
            },
          },
        }),
      },
      include: {
        garden: { select: { id: true, name: true } },
        participants: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
      },
    });

    return NextResponse.json({ ...conversation, isNew: true }, { status: 201 });
  } catch (error) {
    console.error('Failed to create conversation:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
