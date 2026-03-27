'use client';

import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    author: Author;
    publishedAt: string | null;
    readingTime?: number;
    tags: Tag[];
  };
}

/**
 * Retro pixel-style article card for the feed.
 * Shows title, excerpt, author, date, reading time, and tags.
 * @param root0 - Component props
 * @param root0.article - Article data
 * @returns The article card JSX
 */
export function ArticleCard({ article }: ArticleCardProps) {
  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Draft';

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Link href={`/articles/${article.slug}` as any} className="block group">
      <article
        className="pixel-card p-5 h-full transition-transform group-hover:-translate-y-0.5"
        style={{ boxShadow: '3px 3px 0px #302818' }}
      >
        {/* Tags */}
        {article.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag.id}
                className="font-pixel text-[9px] uppercase tracking-widest px-2 py-0.5 border-[1px]"
                style={{
                  borderColor: '#CC6B47',
                  color: '#CC6B47',
                  background: 'rgba(204, 107, 71, 0.06)',
                }}
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Title */}
        <h3
          className="font-pixel text-sm font-bold text-ink-900 mb-2 leading-snug
            group-hover:text-terracotta-700 transition-colors"
        >
          {article.title}
        </h3>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="font-body text-xs text-ink-500 leading-relaxed mb-4 line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t-[1px] border-ink-300">
          {/* Author */}
          <div className="flex items-center gap-2">
            {article.author.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={article.author.image}
                alt={article.author.name ?? 'Author'}
                className="w-6 h-6 rounded-none border-[1px] border-ink-600"
                style={{ boxShadow: '1px 1px 0px #302818' }}
              />
            ) : (
              <div
                className="w-6 h-6 flex items-center justify-center text-xs font-pixel border-[1px] border-ink-600"
                style={{ background: '#E8DFD0', boxShadow: '1px 1px 0px #302818' }}
              >
                {article.author.name ? article.author.name[0].toUpperCase() : '?'}
              </div>
            )}
            <span className="font-body text-[10px] text-ink-600">
              {article.author.name ?? 'Anonymous'}
            </span>
          </div>

          {/* Date + Reading time */}
          <div className="flex items-center gap-3">
            {article.readingTime && (
              <span className="font-pixel text-[10px] text-ink-400">{article.readingTime} min</span>
            )}
            <span className="font-pixel text-[10px] text-ink-400">{formattedDate}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
