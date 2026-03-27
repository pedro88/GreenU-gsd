import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { sanitizeContent, extractExcerpt } from '@/lib/articleUtils';

const updateArticleSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional().nullable(),
  tags: z.array(z.string()).max(10).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/articles/[id] — Get article by ID (author only for drafts).
 * Also accepts ?slug=... for slug-based lookups (bypasses the [id] param).
 */
export async function GET(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  let article;

  if (slug) {
    // Fetch by slug
    article = await prisma.article.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
    });
  } else {
    article = await prisma.article.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  if (!article) {
    return NextResponse.json({ error: 'Article not found' }, { status: 404 });
  }

  // Drafts only visible to author
  if (!article.published) {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== article.authorId) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }
  }

  return NextResponse.json({
    ...article,
    tags: article.tags.map((at) => at.tag),
  });
}

/**
 * PATCH /api/articles/[id] — Update article (author only).
 * @param request
 * @param root0
 * @param root0.params
 */
export async function PATCH(request: NextRequest, { params }: RouteParams): Promise<NextResponse> {
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

  try {
    const body = await request.json();
    const validation = updateArticleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { title, content, excerpt: rawExcerpt, tags } = validation.data;

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && {
          content: sanitizeContent(content),
          excerpt: rawExcerpt ?? extractExcerpt(content),
        }),
        ...(rawExcerpt !== undefined && { excerpt: rawExcerpt }),
        ...(tags !== undefined && {
          tags: {
            deleteMany: {},
            ...(tags.length > 0 && {
              create: await Promise.all(
                tags.map(async (tagName: string) => {
                  const tagSlug = tagName.toLowerCase().trim().replace(/\s+/g, '-');
                  const tag = await prisma.tag.upsert({
                    where: { slug: tagSlug },
                    create: { name: tagName.trim(), slug: tagSlug },
                    update: {},
                  });
                  return { tagId: tag.id };
                })
              ),
            }),
          },
        }),
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
  } catch (error) {
    console.error('Failed to update article:', error);
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

/**
 * DELETE /api/articles/[id] — Delete article (author only).
 * @param _request
 * @param root0
 * @param root0.params
 */
export async function DELETE(
  _request: NextRequest,
  { params }: RouteParams
): Promise<NextResponse> {
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

  await prisma.article.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
