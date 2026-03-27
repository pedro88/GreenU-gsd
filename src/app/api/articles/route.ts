import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { generateSlug, sanitizeContent, extractExcerpt } from '@/lib/articleUtils';

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300).optional(),
  tags: z.array(z.string()).max(10).optional(),
});

/**
 * GET /api/articles
 * Returns published articles (public), with optional search and tag filtering.
 * Supports query params: ?search=...&tag=...&page=...
 * @param request
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const tag = searchParams.get('tag') ?? '';
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const pageSize = 12;

  try {
    const where = {
      published: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { excerpt: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
      ...(tag && {
        tags: {
          some: {
            tag: { slug: tag },
          },
        },
      }),
    };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: {
          author: { select: { id: true, name: true, image: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.article.count({ where }),
    ]);

    const formatted = articles.map((a) => ({
      ...a,
      tags: a.tags.map((at) => at.tag),
      readingTime: Math.max(
        1,
        Math.ceil(
          a.content
            .replace(/<[^>]+>/g, ' ')
            .split(/\s+/)
            .filter(Boolean).length / 200
        )
      ),
    }));

    return NextResponse.json({
      articles: formatted,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

/**
 * POST /api/articles
 * Creates a new draft article. Requires authentication.
 * @param request
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = createArticleSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
    }

    const { title, content, excerpt: rawExcerpt, tags } = validation.data;

    const slug = await generateSlug(title);
    const sanitizedContent = sanitizeContent(content);
    const excerpt = rawExcerpt ?? extractExcerpt(sanitizedContent);

    // Upsert tags and create article
    const article = await prisma.article.create({
      data: {
        title,
        slug,
        content: sanitizedContent,
        excerpt,
        authorId: session.user.id,
        published: false,
        ...(tags &&
          tags.length > 0 && {
            tags: {
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
            },
          }),
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
        tags: { include: { tag: true } },
      },
    });

    return NextResponse.json(
      { ...article, tags: article.tags.map((at) => at.tag) },
      { status: 201 }
    );
  } catch (error) {
    console.error('Failed to create article:', error);
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
