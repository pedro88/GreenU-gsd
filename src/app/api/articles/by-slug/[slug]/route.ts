import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * GET /api/articles/by-slug/[slug] — Public article lookup by slug.
 * Increments view count. Returns isAuthor flag for author actions.
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { slug } = await params;

  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
    },
  });

  if (!article || !article.published) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Increment view count (fire-and-forget)
  prisma.article
    .update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    })
    .catch(() => {});

  // Calculate reading time
  const wordCount = article.content
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Check if current user is the author
  const session = await auth();
  const isAuthor = session?.user?.id === article.authorId;

  return NextResponse.json({
    ...article,
    tags: article.tags.map((at) => at.tag),
    readingTime,
    isAuthor,
  });
}
