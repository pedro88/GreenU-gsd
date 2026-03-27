import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/articles/drafts — Returns the current user's draft articles.
 * Requires authentication.
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const drafts = await prisma.article.findMany({
      where: {
        authorId: session.user.id,
        published: false,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json(
      drafts.map((a) => ({
        ...a,
        tags: a.tags.map((at) => at.tag),
      }))
    );
  } catch (error) {
    console.error('Failed to fetch drafts:', error);
    return NextResponse.json({ error: 'Failed to fetch drafts' }, { status: 500 });
  }
}
