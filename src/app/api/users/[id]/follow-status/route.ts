import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/[id]/follow-status
 * Check whether the current user follows the target user
 * Requires auth — returns { following: false } for unauthenticated
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ following: false });
    }

    const followerId = session.user.id;

    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: { followerId, followingId },
      },
    });

    return NextResponse.json({ following: !!follow });
  } catch (error) {
    console.error('Failed to check follow status:', error);
    return NextResponse.json({ error: 'Failed to check follow status' }, { status: 500 });
  }
}
