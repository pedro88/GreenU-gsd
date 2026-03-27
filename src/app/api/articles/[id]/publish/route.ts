import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/articles/[id]/publish — Toggle published state (author only).
 * Also available as PATCH with { published: boolean }.
 * @param request
 * @param root0
 * @param root0.params
 */
export async function POST(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.article.findUnique({ where: { id } });

  if (!existing) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  if (existing.authorId !== session.user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Toggle published state
  const published = !existing.published;

  const updated = await prisma.article.update({
    where: { id },
    data: {
      published,
      publishedAt: published ? new Date() : null,
    },
    include: {
      author: { select: { id: true, name: true, image: true } },
      tags: { include: { tag: true } },
    },
  });

  return NextResponse.json({
    ...updated,
    tags: updated.tags.map((at) => at.tag),
  });
}
