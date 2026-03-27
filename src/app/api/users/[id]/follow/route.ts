import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { checkAchievements } from '@/lib/achievementService';

/**
 * POST /api/users/[id]/follow
 * Follow another user.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the target user ID
 * @returns A success message with following status, or an error response
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: followingId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = session.user.id;

    // Cannot follow yourself
    if (followerId === followingId) {
      return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
    }

    // Check target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use transaction to create follow and update counts atomically
    await prisma.$transaction([
      // Create follow relationship
      prisma.follow.create({
        data: { followerId, followingId },
      }),
      // Increment follower's followingCount
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { increment: 1 } },
      }),
      // Increment target's followerCount
      prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { increment: 1 } },
      }),
    ]);

    // Check achievements for the followed user (their followerCount increased)
    checkAchievements(followingId, { userId: followingId }).catch(console.error);

    return NextResponse.json({ following: true }, { status: 201 });
  } catch (error) {
    // Prisma unique constraint violation means already following
    if ((error as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Already following this user' }, { status: 409 });
    }
    console.error('Failed to follow user:', error);
    return NextResponse.json({ error: 'Failed to follow user' }, { status: 500 });
  }
}

/**
 * DELETE /api/users/[id]/follow
 * Unfollow a user.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the target user ID
 * @returns A success message with unfollow status, or an error response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: followingId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const followerId = session.user.id;

    // Use transaction to delete and update counts atomically
    const result = await prisma.$transaction([
      // Delete follow relationship
      prisma.follow.deleteMany({
        where: { followerId, followingId },
      }),
      // Decrement follower's followingCount (but don't go below 0)
      prisma.user.update({
        where: { id: followerId },
        data: { followingCount: { decrement: 1 } },
      }),
      // Decrement target's followerCount (but don't go below 0)
      prisma.user.update({
        where: { id: followingId },
        data: { followerCount: { decrement: 1 } },
      }),
    ]);

    // Check if actually deleted (if was not following, deleteMany returns 0)
    const deleted = result[0].count;

    return NextResponse.json({ following: false, deleted });
  } catch (error) {
    console.error('Failed to unfollow user:', error);
    return NextResponse.json({ error: 'Failed to unfollow user' }, { status: 500 });
  }
}
