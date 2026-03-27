'use client';

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArticleCard } from '@/components/article/ArticleCard';

interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

interface Author {
  id: string;
  name: string | null;
  image: string | null;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  author: Author;
  publishedAt: string | null;
  readingTime: number;
  tags: Tag[];
}

interface ArticlesResponse {
  articles: Article[];
  pagination: { page: number; pageSize: number; total: number; totalPages: number };
}

/**
 *
 */
function ArticlesFeedContent() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const tag = searchParams.get('tag') ?? '';

  const [data, setData] = useState<ArticlesResponse | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);

  const fetchArticles = useCallback(async (s: string, t: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (s) params.set('search', s);
      if (t) params.set('tag', t);
      const res = await fetch(`/api/articles?${params}`);
      if (res.ok) {
        setData(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles(search, tag);
  }, [search, tag, fetchArticles]);

  useEffect(() => {
    fetch('/api/articles/tags')
      .then((r) => r.json())
      .then(setTags)
      .catch(() => {});
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set('search', searchInput);
    if (tag) params.set('tag', tag);
    window.location.href = `/articles${params.size ? `?${params}` : ''}`;
  };

  const clearTag = () => {
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    window.location.href = `/articles${params.size ? `?${params}` : ''}`;
  };

  const activeTag = tag ? tags.find((t) => t.slug === tag) : null;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="font-pixel text-2xl font-bold text-ink-900 tracking-wide">
              Garden Articles
            </h1>
            <p className="font-body text-sm text-ink-500 mt-1">
              Tips, stories, and wisdom from the greenU community
            </p>
          </div>
          <Link href="/articles/new" className="retro-button flex items-center gap-2 text-sm">
            <span>✏️</span>
            <span>Write Article</span>
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 retro-input">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search articles..."
              className="w-full bg-transparent outline-none px-3 py-2 font-body text-sm text-ink-800 placeholder:text-ink-400"
            />
          </div>
          <button type="submit" className="retro-button px-4 py-2 text-sm">
            🔍
          </button>
        </div>
      </form>

      {/* Active tag filter */}
      {activeTag && (
        <div className="flex items-center gap-2 mb-4">
          <span className="font-pixel text-xs text-ink-500">Filtered by:</span>
          <span
            className="font-pixel text-xs px-3 py-1 border-[2px] flex items-center gap-2"
            style={{
              borderColor: '#CC6B47',
              background: '#FFCC4D',
              color: '#302818',
              boxShadow: '2px 2px 0px #302818',
            }}
          >
            {activeTag.name}
            <button onClick={clearTag} className="ml-1 font-bold hover:text-terracotta-700">
              ×
            </button>
          </span>
        </div>
      )}

      {/* Tag cloud */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b-[2px] border-ink-300">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/articles?tag=${t.slug}`}
              className={`font-pixel text-[10px] uppercase tracking-widest px-3 py-1 border-[2px] transition-all hover:-translate-y-0.5 ${
                t.slug === tag ? 'border-ink-800' : 'border-ink-500'
              }`}
              style={{
                background: t.slug === tag ? '#CC6B47' : '#E8DFD0',
                color: t.slug === tag ? '#F5EFE0' : '#302818',
                boxShadow: '2px 2px 0px #302818',
              }}
            >
              {t.name} ({t.count})
            </Link>
          ))}
        </div>
      )}

      {/* Articles grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pixel-card p-5 animate-pulse">
              <div className="h-4 bg-ink-300 mb-3 w-3/4" />
              <div className="h-3 bg-ink-300 mb-2 w-full" />
              <div className="h-3 bg-ink-300 mb-2 w-5/6" />
              <div className="h-3 bg-ink-300 w-4/6" />
            </div>
          ))}
        </div>
      ) : data?.articles.length === 0 ? (
        <div className="pixel-card p-12 text-center">
          <div className="text-4xl mb-4">🌱</div>
          <h2 className="font-pixel text-sm text-ink-700 mb-2">No articles yet</h2>
          <p className="font-body text-xs text-ink-400 mb-6">
            {search || tag
              ? 'Try a different search or tag filter.'
              : 'Be the first to share your gardening knowledge!'}
          </p>
          {!search && !tag && (
            <Link href="/articles/new" className="retro-button px-6 py-2 text-sm inline-block">
              Write the first article
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {data?.articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pb-8">
              {data.pagination.page > 1 && (
                <a
                  href={`/articles?page=${data.pagination.page - 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="retro-button px-4 py-2 text-sm"
                >
                  ← Prev
                </a>
              )}
              <span className="font-pixel text-xs text-ink-500 px-4">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </span>
              {data.pagination.page < data.pagination.totalPages && (
                <a
                  href={`/articles?page=${data.pagination.page + 1}${search ? `&search=${search}` : ''}${tag ? `&tag=${tag}` : ''}`}
                  className="retro-button px-4 py-2 text-sm"
                >
                  Next →
                </a>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Public article feed — browse and search published articles.
 * Accessible to everyone (no auth required).
 */
export default function ArticlesPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <Suspense
        fallback={
          <div className="max-w-5xl mx-auto">
            <div className="pixel-card p-12 text-center animate-pulse">
              <div className="font-pixel text-sm text-ink-400">Loading articles...</div>
            </div>
          </div>
        }
      >
        <ArticlesFeedContent />
      </Suspense>
    </main>
  );
}
