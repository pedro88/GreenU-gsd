import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/[id]/following
 * Get paginated list of users that this user follows.
 * No auth required — public info.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with user ID
 * @returns Paginated list of followed users with next cursor, or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
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
