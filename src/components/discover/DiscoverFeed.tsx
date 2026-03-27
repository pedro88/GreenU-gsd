'use client';

import { useState, useEffect, useCallback } from 'react';
import { GardenCard } from './GardenCard';

interface PlantType {
  id: string;
  name: string;
}

interface GardenSummary {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  followerCount: number;
  owner: { id: string; name: string | null; image: string | null };
  zones: { id: string; name: string; type: string; plotCount: number }[];
  topCrops: string[];
  cropCount: number;
}

interface DiscoverFeedProps {
  initialGardens: GardenSummary[];
  plantTypes: PlantType[];
  initialFollowingIds: string[];
}

/**
 * Discover feed with search, sort, filter, and pagination
 */
export function DiscoverFeed({ initialGardens, plantTypes, initialFollowingIds }: DiscoverFeedProps) {
  const [gardens, setGardens] = useState<GardenSummary[]>(initialGardens);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set(initialFollowingIds));
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  const [filterCrop, setFilterCrop] = useState('');
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(false);

  const fetchGardens = useCallback(async (reset: boolean = false) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (sort === 'popular') params.set('sort', 'popular');
      if (search.trim()) params.set('search', search.trim());
      if (filterCrop) params.set('filterCrop', filterCrop);
      if (!reset && cursor) params.set('cursor', cursor);

      const res = await fetch(`/api/discover?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (reset) {
          setGardens(data.gardens);
          setCursor(data.nextCursor);
        } else {
          setGardens((prev) => [...prev, ...data.gardens]);
          setCursor(data.nextCursor);
        }
        setHasMore(!!data.nextCursor);
      }
    } finally {
      setLoading(false);
      if (reset) setInitialLoad(true);
    }
  }, [sort, search, filterCrop, cursor]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setCursor(null);
      fetchGardens(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filterCrop, sort]);

  const handleFollow = async (ownerId: string) => {
    const method = followingIds.has(ownerId) ? 'DELETE' : 'POST';
    const res = await fetch(`/api/users/${ownerId}/follow`, { method });
    if (res.ok) {
      setFollowingIds((prev) => {
        const next = new Set(prev);
        if (next.has(ownerId)) next.delete(ownerId);
        else next.add(ownerId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Search + filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gardens..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as 'recent' | 'popular')}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="recent">Most recent</option>
          <option value="popular">Most popular</option>
        </select>
        <select
          value={filterCrop}
          onChange={(e) => { setFilterCrop(e.target.value); setCursor(null); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
        >
          <option value="">All crops</option>
          {plantTypes.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Results count */}
      {gardens.length > 0 && (
        <p className="text-sm text-gray-500">
          {gardens.length} garden{gardens.length !== 1 ? 's' : ''} found
          {search && ` for "${search}"`}
          {filterCrop && ` with ${filterCrop}`}
        </p>
      )}

      {/* Garden grid */}
      {gardens.length === 0 && !loading ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🔍</div>
          <h3 className="font-semibold text-gray-700 mb-1">No gardens found</h3>
          <p className="text-sm text-gray-400">
            {search || filterCrop
              ? 'Try adjusting your search or filter'
              : 'No public gardens yet — be the first to share!'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gardens.map((garden) => (
              <GardenCard
                key={garden.id}
                garden={garden}
                followingIds={followingIds}
                onFollow={handleFollow}
              />
            ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={() => fetchGardens(false)}
                disabled={loading}
                className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {loading && gardens.length === 0 && (
        <div className="flex items-center justify-center py-16">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
        </div>
      )}
    </div>
  );
}
