'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArticleEditor } from '@/components/article/ArticleEditor';
import Link from 'next/link';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
}

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [article, setArticle] = useState<Article | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [notFound, setNotFound] = useState(false);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!slug) return;

    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/articles/by-slug/${slug}`);
        if (res.status === 401) {
          router.push('/auth/signin');
          return;
        }
        if (res.status === 404) {
          setNotFound(true);
          return;
        }
        if (res.ok) {
          const data: Article = await res.json();
          setArticle(data);
          setTitle(data.title);
          setContent(data.content);
          setExcerpt(data.excerpt ?? '');
          setTagsInput(data.tags.map((t) => t.name).join(', '));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug, router]);

  const saveArticle = useCallback(
    async (opts: { published?: boolean; silent?: boolean } = {}) => {
      if (!title.trim()) {
        if (!opts.silent) setError('A title is required.');
        return false;
      }

      if (!article) return false;

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = { title: title.trim(), content, excerpt: excerpt.trim() || undefined, tags };

      try {
        const res = await fetch(`/api/articles/${article.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          if (!opts.silent) setError(data.error?.message ?? 'Failed to save.');
          return false;
        }

        const updated: Article = await res.json();

        if (opts.published !== undefined && opts.published !== updated.published) {
          await fetch(`/api/articles/${article.id}/publish`, { method: 'POST' });
        }

        if (!opts.silent) setLastSaved(new Date());
        setArticle(updated);
        return true;
      } catch {
        if (!opts.silent) setError('Network error. Please try again.');
        return false;
      }
    },
    [title, content, excerpt, tagsInput, article]
  );

  useEffect(() => {
    autoSaveRef.current = async () => {
      await saveArticle({ silent: true });
      setLastSaved(new Date());
    };
  }, [saveArticle]);

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    if (title || content) {
      saveTimerRef.current = setTimeout(() => {
        autoSaveRef.current();
      }, 30_000);
    }
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [title, content, excerpt, tagsInput]);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    await saveArticle({ published: false });
    setSaving(false);
  };

  const handlePublish = async () => {
    setPublishing(true);
    setError('');
    const success = await saveArticle({ published: true });
    setPublishing(false);
    if (success) {
      router.push('/articles/drafts');
    }
  };

  const handleUnpublish = async () => {
    setPublishing(true);
    setError('');
    await saveArticle({ published: false });
    setPublishing(false);
  };

  const handleDelete = async () => {
    if (!article) return;
    if (!confirm('Delete this article permanently? This cannot be undone.')) return;
    const res = await fetch(`/api/articles/${article.id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/articles/drafts');
    }
  };

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto pixel-card p-8 animate-pulse">
          <div className="h-6 bg-ink-300 mb-4 w-1/2" />
          <div className="h-4 bg-ink-300 w-full" />
        </div>
      </main>
    );
  }

  if (notFound || !article) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-xl mx-auto text-center pixel-card p-12">
          <div className="text-5xl mb-4">🔍</div>
          <h1 className="font-pixel text-xl text-ink-900 mb-2">Article Not Found</h1>
          <Link
            href="/articles/drafts"
            className="retro-button px-6 py-2 text-sm inline-block mt-4"
          >
            My Drafts
          </Link>
        </div>
      </main>
    );
  }

  const wordCount = content
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link
              href="/articles/drafts"
              className="font-pixel text-xs text-ink-500 hover:text-terracotta-600 tracking-widest"
            >
              ← Drafts
            </Link>
            <span
              className="font-pixel text-[10px] px-2 py-0.5 border-[1px]"
              style={{
                borderColor: article.published ? '#4A7C59' : '#CC6B47',
                color: article.published ? '#4A7C59' : '#CC6B47',
                background: 'rgba(204, 107, 71, 0.06)',
              }}
            >
              {article.published ? '✅ Published' : '📝 Draft'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="font-pixel text-[10px] text-ink-400">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="retro-button px-4 py-2 text-xs"
            >
              {saving ? 'Saving...' : '💾 Save'}
            </button>
            {article.published ? (
              <button
                onClick={handleUnpublish}
                disabled={publishing}
                className="retro-button px-4 py-2 text-xs"
              >
                {publishing ? '...' : '📥 Unpublish'}
              </button>
            ) : (
              <button
                onClick={handlePublish}
                disabled={publishing}
                className="retro-button px-4 py-2 text-xs"
                style={{
                  background: '#4A7C59',
                  color: '#F5EFE0',
                  boxShadow: '2px 2px 0px #302818',
                }}
              >
                {publishing ? 'Publishing...' : '🌱 Publish'}
              </button>
            )}
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-xs border-[2px]"
              style={{
                borderColor: '#CC6B47',
                color: '#CC6B47',
                background: '#E8DFD0',
                boxShadow: '2px 2px 0px #302818',
              }}
            >
              🗑️
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div
            className="pixel-card p-4 mb-4 text-xs font-body"
            style={{ background: 'rgba(204, 107, 71, 0.1)', borderColor: '#CC6B47' }}
          >
            {error}
          </div>
        )}

        {/* Title */}
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Article title..."
            className="w-full font-pixel text-xl font-bold text-ink-900 bg-transparent outline-none
              placeholder:text-ink-400 border-b-[2px] border-ink-300
              focus:border-terracotta-500 transition-colors pb-2"
            style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
            maxLength={200}
          />
        </div>

        {/* Excerpt */}
        <div className="mb-4">
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short description (shown in article cards)..."
            className="w-full font-body text-sm text-ink-700 bg-transparent outline-none
              resize-none placeholder:text-ink-400 border-b-[2px] border-ink-300
              focus:border-terracotta-500 transition-colors pb-2"
            rows={2}
            maxLength={300}
          />
        </div>

        {/* Tags */}
        <div className="mb-6">
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (comma-separated: tomatoes, composting, beginner)..."
            className="w-full font-body text-sm text-ink-700 bg-transparent outline-none
              placeholder:text-ink-400 border-b-[2px] border-ink-300
              focus:border-terracotta-500 transition-colors pb-2"
          />
          {tagsInput && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tagsInput
                .split(',')
                .map((t) => t.trim())
                .filter(Boolean)
                .map((tag) => (
                  <span
                    key={tag}
                    className="font-pixel text-[10px] uppercase tracking-widest px-2 py-0.5 border-[1px]"
                    style={{
                      borderColor: '#CC6B47',
                      color: '#CC6B47',
                      background: 'rgba(204,107,71,0.06)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
            </div>
          )}
        </div>

        {/* Editor */}
        <div className="pixel-card mb-4" style={{ boxShadow: '3px 3px 0px #302818' }}>
          <ArticleEditor
            content={content}
            onChange={setContent}
            placeholder="Continue writing..."
          />
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs">
          <span className="font-pixel text-[10px] text-ink-400 tracking-widest">
            {wordCount} words · {Math.max(1, Math.ceil(wordCount / 200))} min read
          </span>
          <span className="font-pixel text-[10px] text-ink-400 tracking-widest">
            Autosaves every 30 seconds
          </span>
        </div>
      </div>
    </main>
  );
}
