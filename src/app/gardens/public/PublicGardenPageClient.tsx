'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface CropSummary {
  id: string;
  name: string;
  plantTypeId: string;
  status: string;
}

interface PlotSummary {
  id: string;
  name: string;
  sizeSqFt: number | null;
  crops: CropSummary[];
}

interface ZoneLayout {
  id: string;
  name: string;
  type: string;
  plots: PlotSummary[];
}

interface PublicGarden {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  isPublic: boolean;
  owner: { id: string; name: string | null; image: string | null };
  zones: ZoneLayout[];
}

interface PublicGardenPageClientProps {
  gardenId: string;
}

/**
 * Client component for displaying a public garden in read-only mode.
 * Allows authenticated users to follow the garden owner.
 * @param root0 - Props object
 * @param root0.gardenId - The ID of the public garden to display
 * @returns The public garden page JSX
 */
export function PublicGardenPageClient({ gardenId }: PublicGardenPageClientProps) {
  const [garden, setGarden] = useState<PublicGarden | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [following, setFollowing] = useState(false);
  const [togglingFollow, setTogglingFollow] = useState(false);

  useEffect(() => {
    /**
     * Fetches the garden data from the API and checks follow status.
     */
    async function fetchGarden() {
      try {
        const res = await fetch(`/api/gardens/${gardenId}`);
        if (res.ok) {
          const data = await res.json();
          setGarden(data);
          // Check follow status if logged in
          const statusRes = await fetch(`/api/users/${data.owner.id}/follow-status`);
          if (statusRes.ok) {
            const status = await statusRes.json();
            setFollowing(status.following);
          }
        } else if (res.status === 404) {
          setError('Garden not found');
        } else if (res.status === 401) {
          setError('This garden is private');
        } else {
          setError('Failed to load garden');
        }
      } catch {
        setError('Failed to load garden');
      } finally {
        setLoading(false);
      }
    }
    fetchGarden();
  }, [gardenId]);

  const handleFollow = async () => {
    if (!garden) return;
    setTogglingFollow(true);
    try {
      const method = following ? 'DELETE' : 'POST';
      const res = await fetch(`/api/users/${garden.owner.id}/follow`, { method });
      if (res.ok) {
        setFollowing(!following);
      }
    } catch {
      // silently fail
    } finally {
      setTogglingFollow(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
        <div className="text-4xl mb-3">{error === 'This garden is private' ? '🔒' : '🌱'}</div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          {error === 'This garden is private' ? 'Private Garden' : 'Garden Not Found'}
        </h1>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link
          href="/discover"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors text-sm"
        >
          Browse discover
        </Link>
      </div>
    );
  }

  if (!garden) return null;

  const statusColors: Record<string, string> = {
    PLANTED: 'bg-gray-200 text-gray-700',
    SEEDLING: 'bg-yellow-100 text-yellow-800',
    VEGETATIVE: 'bg-green-200 text-green-800',
    FLOWERING: 'bg-purple-100 text-purple-800',
    FRUITING: 'bg-orange-100 text-orange-800',
    HARVESTING: 'bg-emerald-200 text-emerald-800',
    HARVESTED: 'bg-gray-100 text-gray-500',
    FAILED: 'bg-red-100 text-red-700',
  };

  const zoneTypeColors: Record<string, string> = {
    OUTDOOR: 'border-green-300 bg-green-50',
    GREENHOUSE: 'border-blue-300 bg-blue-50',
    ORCHARD: 'border-amber-300 bg-amber-50',
    INDOOR: 'border-purple-300 bg-purple-50',
    TERRACE: 'border-teal-300 bg-teal-50',
  };

  const ownerInitials =
    garden.owner.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/discover"
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                ← Discover
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <div>
                <h1 className="font-semibold text-gray-900">{garden.name}</h1>
                {garden.location && <p className="text-xs text-gray-400">{garden.location}</p>}
              </div>
            </div>

            {/* Owner + follow */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-600 text-xs font-bold text-white">
                  {ownerInitials}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-800">
                    {garden.owner.name || 'Gardener'}
                  </div>
                  <div className="text-xs text-gray-400">
                    {garden.zones.length} zone{garden.zones.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <button
                onClick={handleFollow}
                disabled={togglingFollow}
                className={`px-3 py-1.5 text-sm rounded-lg font-medium transition-colors
                  ${
                    following
                      ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      : 'bg-green-600 text-white hover:bg-green-500'
                  } disabled:opacity-50`}
              >
                {togglingFollow ? '...' : following ? 'Following' : '+ Follow'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Garden content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {garden.description && (
          <p className="text-sm text-gray-600 mb-6 bg-white rounded-lg p-4 border border-gray-200">
            {garden.description}
          </p>
        )}

        {garden.zones.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-3xl mb-2">🌱</div>
            <p>This garden has no zones yet</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {garden.zones.map((zone) => (
              <div
                key={zone.id}
                className={`rounded-xl border-2 p-3 ${zoneTypeColors[zone.type] ?? zoneTypeColors.OUTDOOR}`}
              >
                <h3 className="font-semibold text-gray-800 text-sm mb-2">{zone.name}</h3>
                <div className="space-y-1.5">
                  {zone.plots.map((plot) => (
                    <div key={plot.id} className="bg-white border border-gray-200 rounded-lg p-2">
                      <div className="text-xs font-medium text-gray-600 mb-1">{plot.name}</div>
                      <div className="flex flex-wrap gap-1">
                        {plot.crops.length === 0 ? (
                          <span className="text-xs text-gray-400 italic">Empty</span>
                        ) : (
                          plot.crops.map((crop) => (
                            <span
                              key={crop.id}
                              className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColors[crop.status] ?? 'bg-gray-100 text-gray-700'}`}
                            >
                              {crop.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
