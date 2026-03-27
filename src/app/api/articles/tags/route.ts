import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/articles/tags — Returns all tags with article counts.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { articles: { where: { article: { published: true } } } },
        },
      },
      orderBy: { articles: { _count: 'desc' } },
    });

    return NextResponse.json(
      tags.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        count: t._count.articles,
      }))
    );
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 });
  }
}
