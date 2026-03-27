'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArticleEditor } from '@/components/article/ArticleEditor';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  published: boolean;
  tags: Array<{ id: string; name: string; slug: string }>;
}

/**
 *
 */
export default function NewArticlePage() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState('');
  const [articleId, setArticleId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveRef = useRef<() => void>(() => {});

  // Autosave every 30 seconds if content changed
  const scheduleAutoSave = useCallback((html: string) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      autoSaveRef.current();
    }, 30_000);
  }, []);

  const createOrUpdateArticle = useCallback(
    async (opts: { published?: boolean; silent?: boolean } = {}) => {
      if (!title.trim()) {
        if (!opts.silent) setError('A title is required to save.');
        return false;
      }

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = { title: title.trim(), content, excerpt: excerpt.trim() || undefined, tags };

      try {
        if (articleId) {
          // Update existing
          const res = await fetch(`/api/articles/${articleId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const data = await res.json();
            if (!opts.silent) setError(data.error?.message ?? 'Failed to save.');
            return false;
          }

          const updated = await res.json();

          if (opts.published !== undefined && opts.published !== updated.published) {
            await fetch(`/api/articles/${articleId}/publish`, { method: 'POST' });
          }
        } else {
          // Create new
          const res = await fetch('/api/articles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            const data = await res.json();
            if (!opts.silent) setError(data.error?.message ?? 'Failed to save.');
            return false;
          }

          const created: Article = await res.json();
          setArticleId(created.id);

          if (opts.published) {
            await fetch(`/api/articles/${created.id}/publish`, { method: 'POST' });
          }
        }

        if (!opts.silent) setLastSaved(new Date());
        return true;
      } catch {
        if (!opts.silent) setError('Network error. Please try again.');
        return false;
      }
    },
    [title, content, excerpt, tagsInput, articleId]
  );

  // Set up auto-save reference
  useEffect(() => {
    autoSaveRef.current = async () => {
      await createOrUpdateArticle({ silent: true });
      setLastSaved(new Date());
    };
  }, [createOrUpdateArticle]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const handleSaveDraft = async () => {
    setSaving(true);
    setError('');
    await createOrUpdateArticle({ published: false });
    setSaving(false);
  };

  const handlePublish = async () => {
    if (!title.trim()) {
      setError('A title is required to publish.');
      return;
    }
    setPublishing(true);
    setError('');
    const success = await createOrUpdateArticle({ published: true });
    setPublishing(false);
    if (success && articleId) {
      router.push(`/articles/${title.trim().toLowerCase().replace(/\s+/g, '-').slice(0, 40)}...`);
    }
  };

  const handleContentChange = (html: string) => {
    setContent(html);
    scheduleAutoSave(html);
  };

  const wordCount = content
    .replace(/<[^>]+>/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-pixel text-xl font-bold text-ink-900 tracking-wide">New Article</h1>
          <div className="flex items-center gap-3">
            {lastSaved && (
              <span className="font-pixel text-[10px] text-ink-400 tracking-widest">
                Saved {lastSaved.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="retro-button px-4 py-2 text-xs"
            >
              {saving ? 'Saving...' : '💾 Save Draft'}
            </button>
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="retro-button px-4 py-2 text-xs"
              style={{ background: '#4A7C59', color: '#F5EFE0', boxShadow: '2px 2px 0px #302818' }}
            >
              {publishing ? 'Publishing...' : '🌱 Publish'}
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
            onChange={handleContentChange}
            placeholder="Share your gardening knowledge, tips, or stories..."
          />
        </div>

        {/* Footer stats */}
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
