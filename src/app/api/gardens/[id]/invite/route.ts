import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { randomBytes } from 'crypto';

/**
 * GET /api/gardens/[id]/invite
 * List all pending invites for a garden (owner only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can view invites
    const garden = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const invites = await prisma.gardenInvite.findMany({
      where: { gardenId: id },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(invites);
  } catch (error) {
    console.error('Failed to list invites:', error);
    return NextResponse.json({ error: 'Failed to list invites' }, { status: 500 });
  }
}

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['EDITOR', 'VIEWER']),
});

/**
 * POST /api/gardens/[id]/invite
 * Create an invite for a garden (owner only)
 * If user with email already exists, optionally auto-add as collaborator
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can invite
    const garden = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
      include: { user: { select: { email: true } } },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Garden not found or not owned by you' }, { status: 404 });
    }

    const body = await request.json();
    const validation = inviteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { email, role } = validation.data;

    // Check if invitee is the garden owner
    if (email === garden.user?.email) {
      return NextResponse.json({ error: 'Cannot invite the garden owner' }, { status: 400 });
    }

    // Check if user already has access
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingAccess = await prisma.gardenAccess.findUnique({
        where: { userId_gardenId: { userId: existingUser.id, gardenId: id } },
      });
      if (existingAccess) {
        return NextResponse.json({ error: 'User already has access to this garden' }, { status: 409 });
      }
    }

    // Remove existing invite for this email/garden
    await prisma.gardenInvite.deleteMany({
      where: { gardenId: id, email },
    });

    // Create new invite with token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.gardenInvite.create({
      data: {
        gardenId: id,
        email,
        role,
        token,
        invitedBy: session.user.id,
        expiresAt,
      },
      include: {
        inviter: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(invite, { status: 201 });
  } catch (error) {
    console.error('Failed to create invite:', error);
    return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 });
  }
}
