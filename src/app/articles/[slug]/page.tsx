'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  author: Author;
  publishedAt: string | null;
  readingTime: number;
  viewCount: number;
  tags: Tag[];
  isAuthor: boolean;
}

/**
 *
 */
export default function ArticleViewPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/by-slug/${slug}`);
        if (res.status === 404) {
          setNotFound(true);
        } else if (res.ok) {
          setArticle(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="pixel-card p-8 animate-pulse">
            <div className="h-8 bg-ink-300 mb-4 w-3/4" />
            <div className="h-4 bg-ink-300 mb-2 w-full" />
            <div className="h-4 bg-ink-300 mb-2 w-5/6" />
          </div>
        </div>
      </main>
    );
  }

  if (notFound) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto text-center pixel-card p-12">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-pixel text-xl text-ink-900 mb-2">Article Not Found</h1>
          <p className="font-body text-sm text-ink-500 mb-6">
            This article may have been removed or the URL is incorrect.
          </p>
          <Link href="/articles" className="retro-button px-6 py-2 text-sm inline-block">
            Browse Articles
          </Link>
        </div>
      </main>
    );
  }

  if (!article) return null;

  const formattedDate = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/articles"
          className="inline-flex items-center gap-2 font-pixel text-xs text-ink-500 hover:text-terracotta-600 mb-6 tracking-widest uppercase"
        >
          ← All Articles
        </Link>

        {/* Article card */}
        <article className="pixel-card p-8" style={{ boxShadow: '4px 4px 0px #302818' }}>
          {/* Tags */}
          {article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/articles?tag=${tag.slug}`}
                  className="font-pixel text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1px]"
                  style={{
                    borderColor: '#CC6B47',
                    color: '#CC6B47',
                    background: 'rgba(204,107,71,0.06)',
                  }}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}

          {/* Title */}
          <h1
            className="font-pixel text-2xl font-bold text-ink-900 mb-4 leading-tight"
            style={{ color: '#302818' }}
          >
            {article.title}
          </h1>

          {/* Author + meta row */}
          <div className="flex items-center justify-between flex-wrap gap-3 mb-8 pb-6 border-b-[2px] border-ink-300">
            <div className="flex items-center gap-3">
              {article.author.image ? (
                <img
                  src={article.author.image}
                  alt={article.author.name ?? 'Author'}
                  className="w-10 h-10 border-[2px] border-ink-600"
                  style={{ boxShadow: '2px 2px 0px #302818' }}
                />
              ) : (
                <div
                  className="w-10 h-10 flex items-center justify-center font-pixel text-lg font-bold border-[2px] border-ink-600"
                  style={{ background: '#E8DFD0', boxShadow: '2px 2px 0px #302818' }}
                >
                  {article.author.name?.[0]?.toUpperCase() ?? '?'}
                </div>
              )}
              <div>
                <div className="font-pixel text-xs font-bold text-ink-800">
                  {article.author.name ?? 'Anonymous'}
                </div>
                <div className="font-body text-[10px] text-ink-400">{formattedDate}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-pixel text-[10px] text-ink-400">
                👁 {article.viewCount} views
              </span>
              <span className="font-pixel text-[10px] text-ink-400">
                📖 {article.readingTime} min read
              </span>
            </div>
          </div>

          {/* Article content */}
          <div className="article-body" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Edit button (author only) */}
          {article.isAuthor && (
            <div className="mt-8 pt-6 border-t-[2px] border-ink-300 flex gap-3">
              <Link
                href={`/articles/${article.slug}/edit`}
                className="retro-button px-4 py-2 text-xs"
              >
                ✏️ Edit Article
              </Link>
            </div>
          )}
        </article>

        {/* Author bio */}
        <div className="mt-6 pixel-card p-5 flex items-center gap-4">
          {article.author.image ? (
            <img
              src={article.author.image}
              alt={article.author.name ?? 'Author'}
              className="w-14 h-14 border-[2px] border-ink-600"
              style={{ boxShadow: '2px 2px 0px #302818' }}
            />
          ) : (
            <div
              className="w-14 h-14 flex items-center justify-center font-pixel text-xl font-bold border-[2px] border-ink-600"
              style={{ background: '#E8DFD0', boxShadow: '2px 2px 0px #302818' }}
            >
              {article.author.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          )}
          <div>
            <div className="font-pixel text-xs text-ink-500 uppercase tracking-widest mb-0.5">
              Written by
            </div>
            <div className="font-pixel text-sm font-bold text-ink-900">
              {article.author.name ?? 'Anonymous Gardener'}
            </div>
            <Link
              href={`/profile?user=${article.author.id}`}
              className="font-body text-xs text-terracotta-600 hover:text-terracotta-800 mt-0.5 inline-block"
            >
              View profile →
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .article-body {
          font-family: 'Quicksand', sans-serif;
          font-size: 1rem;
          line-height: 1.85;
          color: #302818;
        }
        .article-body h2 {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: #302818;
          margin: 2rem 0 1rem;
          border-bottom: 2px solid #CC6B47;
          padding-bottom: 0.25rem;
        }
        .article-body h3 {
          font-family: 'Pixelify Sans', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: #302818;
          margin: 1.5rem 0 0.75rem;
        }
        .article-body p { margin: 0.875rem 0; }
        .article-body ul, .article-body ol {
          padding-left: 1.5rem;
          margin: 1rem 0;
        }
        .article-body li { margin: 0.375rem 0; }
        .article-body blockquote {
          border-left: 4px solid #CC6B47;
          padding-left: 1rem;
          margin: 1.5rem 0;
          color: #5C4B26;
          font-style: italic;
          background: rgba(204, 107, 71, 0.06);
          padding: 0.75rem 1rem;
        }
        .article-body pre {
          background: #302818;
          color: #F5EFE0;
          padding: 1.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
          overflow-x: auto;
          margin: 1.5rem 0;
          border: 2px solid #302818;
          box-shadow: 4px 4px 0px #CC6B47;
        }
        .article-body code {
          background: rgba(48, 40, 24, 0.08);
          padding: 0.125rem 0.375rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875em;
          color: #CC6B47;
          border: 1px solid rgba(48, 40, 24, 0.15);
        }
        .article-body pre code {
          background: none;
          color: inherit;
          border: none;
          padding: 0;
        }
        .article-body a {
          color: #CC6B47;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .article-body a:hover { color: #4A7C59; }
        .article-body img {
          max-width: 100%;
          height: auto;
          display: block;
          margin: 1.5rem auto;
          border: 2px solid #302818;
          box-shadow: 4px 4px 0px rgba(48, 40, 24, 0.3);
        }
        .article-body hr {
          border: none;
          border-top: 2px solid #CC6B47;
          margin: 2.5rem 0;
        }
        .article-body strong { font-weight: 700; }
        .article-body em { font-style: italic; }
      `}</style>
    </main>
  );
}
