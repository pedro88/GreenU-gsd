import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/invites/[token]
 * Get invite details (public — no auth needed to view invite before accepting).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the invite token
 * @returns The invite details, or an error response if not found or expired
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;

    const invite = await prisma.gardenInvite.findUnique({
      where: { token },
      include: {
        garden: {
          select: { id: true, name: true, description: true, user: { select: { name: true } } },
        },
        inviter: { select: { name: true, email: true } },
      },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    return NextResponse.json({
      id: invite.id,
      gardenId: invite.gardenId,
      gardenName: invite.garden.name,
      gardenOwner: invite.garden.user.name,
      role: invite.role,
      inviterName: invite.inviter.name,
      email: invite.email,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error('Failed to get invite:', error);
    return NextResponse.json({ error: 'Failed to get invite' }, { status: 500 });
  }
}

/**
 * POST /api/invites/[token]
 * Accept an invite (requires auth — must be the invited email).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the invite token
 * @returns The access record, or an error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth();

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invite = await prisma.gardenInvite.findUnique({
      where: { token },
      include: { garden: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    if (invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Invite has expired' }, { status: 410 });
    }

    // Must be the invited email
    if (invite.email.toLowerCase() !== session.user.email.toLowerCase()) {
      return NextResponse.json(
        { error: 'This invite was sent to a different email address' },
        { status: 403 }
      );
    }

    // Check if user already has access
    const existing = await prisma.gardenAccess.findUnique({
      where: { userId_gardenId: { userId: session.user.id, gardenId: invite.gardenId } },
    });

    if (existing) {
      // Already has access — delete the invite and return success
      await prisma.gardenInvite.delete({ where: { token } });
      return NextResponse.json({
        message: 'You already have access to this garden',
        gardenId: invite.gardenId,
      });
    }

    // Create access record
    const access = await prisma.gardenAccess.create({
      data: {
        userId: session.user.id,
        gardenId: invite.gardenId,
        role: invite.role,
      },
    });

    // Delete the invite after acceptance
    await prisma.gardenInvite.delete({ where: { token } });

    return NextResponse.json(
      {
        message: 'Invite accepted',
        access: { ...access, gardenId: invite.gardenId, gardenName: invite.garden.name },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to accept invite:', error);
    return NextResponse.json({ error: 'Failed to accept invite' }, { status: 500 });
  }
}

/**
 * DELETE /api/invites/[token]
 * Cancel an invite (owner only — or inviter).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the invite token
 * @returns A success message, or an error response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invite = await prisma.gardenInvite.findUnique({
      where: { token },
      include: { garden: true },
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Only garden owner or the inviter can cancel
    if (invite.garden.userId !== session.user.id && invite.invitedBy !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized to cancel this invite' }, { status: 403 });
    }

    await prisma.gardenInvite.delete({ where: { token } });

    return NextResponse.json({ message: 'Invite cancelled' });
  } catch (error) {
    console.error('Failed to cancel invite:', error);
    return NextResponse.json({ error: 'Failed to cancel invite' }, { status: 500 });
  }
}
