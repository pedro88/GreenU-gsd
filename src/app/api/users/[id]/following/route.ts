import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/[id]/following
 * Get paginated list of users that this user follows
 * No auth required — public info
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);

    const following = await prisma.follow.findMany({
      where: { followerId: id },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            followerCount: true,
            followingCount: true,
          },
        },
      },
    });

    const hasMore = following.length > limit;
    const items = hasMore ? following.slice(0, -1) : following;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      following: items.map((f) => f.following),
      nextCursor,
    });
  } catch (error) {
    console.error('Failed to fetch following:', error);
    return NextResponse.json({ error: 'Failed to fetch following' }, { status: 500 });
  }
}
