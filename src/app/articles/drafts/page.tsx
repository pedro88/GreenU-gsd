'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface DraftArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  updatedAt: string;
  tags: Array<{ id: string; name: string; slug: string }>;
}

/**
 *
 */
export default function DraftsPage() {
  const router = useRouter();
  const [drafts, setDrafts] = useState<DraftArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchDrafts = async () => {
      try {
        const res = await fetch('/api/articles/drafts');
        if (res.status === 401) {
          router.push('/auth/signin');
          return;
        }
        if (res.ok) {
          setDrafts(await res.json());
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDrafts();
  }, [router]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this article permanently?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setDrafts((d) => d.filter((a) => a.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-pixel text-xl font-bold text-ink-900 tracking-wide">My Drafts</h1>
            <p className="font-body text-xs text-ink-500 mt-1">
              {drafts.length} {drafts.length === 1 ? 'draft' : 'drafts'}
            </p>
          </div>
          <Link href="/articles/new" className="retro-button px-4 py-2 text-xs">
            ✏️ New Article
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="pixel-card p-5 animate-pulse">
                <div className="h-4 bg-ink-300 mb-2 w-3/4" />
                <div className="h-3 bg-ink-300 w-1/2" />
              </div>
            ))}
          </div>
        ) : drafts.length === 0 ? (
          <div className="pixel-card p-12 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h2 className="font-pixel text-sm text-ink-700 mb-2">No drafts yet</h2>
            <p className="font-body text-xs text-ink-400 mb-6">Start writing your first article!</p>
            <Link href="/articles/new" className="retro-button px-6 py-2 text-sm inline-block">
              Write an article
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {drafts.map((draft) => (
              <div
                key={draft.id}
                className="pixel-card p-5 flex items-start justify-between gap-4"
                style={{ boxShadow: '3px 3px 0px #302818' }}
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/articles/${draft.slug}/edit`}
                    className="font-pixel text-sm font-bold text-ink-900 hover:text-terracotta-600 block truncate"
                  >
                    {draft.title || '(Untitled)'}
                  </Link>
                  {draft.excerpt && (
                    <p className="font-body text-xs text-ink-500 mt-1 truncate">{draft.excerpt}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    {draft.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag.id}
                        className="font-pixel text-[9px] uppercase tracking-widest"
                        style={{ color: '#CC6B47' }}
                      >
                        #{tag.name}
                      </span>
                    ))}
                    <span className="font-pixel text-[10px] text-ink-400">
                      {new Date(draft.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link
                    href={`/articles/${draft.slug}/edit`}
                    className="retro-button px-3 py-1.5 text-xs"
                  >
                    ✏️ Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(draft.id)}
                    disabled={deletingId === draft.id}
                    className="px-3 py-1.5 text-xs border-[2px] transition-all"
                    style={{
                      borderColor: deletingId === draft.id ? '#8B7355' : '#CC6B47',
                      color: '#CC6B47',
                      background: '#E8DFD0',
                      boxShadow: '2px 2px 0px #302818',
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
