import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/users/[id]/followers
 * Get paginated list of followers for a user.
 * No auth required — public info.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with user ID
 * @returns Paginated list of followers with next cursor, or an error response
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

    const followers = await prisma.follow.findMany({
      where: { followingId: id },
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        follower: {
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

    const hasMore = followers.length > limit;
    const items = hasMore ? followers.slice(0, -1) : followers;
    const nextCursor = hasMore ? items[items.length - 1]?.id : null;

    return NextResponse.json({
      followers: items.map((f) => f.follower),
      nextCursor,
    });
  } catch (error) {
    console.error('Failed to fetch followers:', error);
    return NextResponse.json({ error: 'Failed to fetch followers' }, { status: 500 });
  }
}
