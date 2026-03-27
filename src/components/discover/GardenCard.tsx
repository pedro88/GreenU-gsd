'use client';

import { useState } from 'react';
import Link from 'next/link';

interface GardenCardProps {
  garden: {
    id: string;
    name: string;
    description: string | null;
    location: string | null;
    followerCount: number;
    owner: { id: string; name: string | null; image: string | null };
    zones: { id: string; name: string; type: string; plotCount: number }[];
    topCrops: string[];
    cropCount: number;
  };
  followingIds: Set<string>;
  onFollow: (ownerId: string) => Promise<void>;
}

/**
 * Card for displaying a garden in the discover feed.
 * Shows garden name, owner, location, zones, top crops, follower count, and follow button.
 */
export function GardenCard({ garden, followingIds, onFollow }: GardenCardProps) {
  const [following, setFollowing] = useState(followingIds.has(garden.owner.id));
  const [loading, setLoading] = useState(false);

  const ownerInitials = garden.owner.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    try {
      await onFollow(garden.owner.id);
      setFollowing(!following);
    } finally {
      setLoading(false);
    }
  };

  const zoneTypeColors: Record<string, string> = {
    OUTDOOR: 'bg-green-100 text-green-700',
    GREENHOUSE: 'bg-blue-100 text-blue-700',
    ORCHARD: 'bg-amber-100 text-amber-700',
    INDOOR: 'bg-purple-100 text-purple-700',
    TERRACE: 'bg-teal-100 text-teal-700',
  };

  return (
    <Link
      href={`/gardens/${garden.id}`}
      className="block bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:shadow-md transition-all group"
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b border-gray-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-700 transition-colors">
              {garden.name}
            </h3>
            {garden.location && (
              <p className="text-xs text-gray-400 mt-0.5 truncate">{garden.location}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="text-xs text-gray-400 flex items-center gap-1">
              <span>👥</span>
              <span>{garden.followerCount}</span>
            </div>
            {garden.owner.id && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors
                  ${following
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-green-600 text-white hover:bg-green-500'
                  } disabled:opacity-50`}
              >
                {loading ? '...' : following ? 'Following' : '+ Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner row */}
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-200 text-[10px] font-bold text-green-800">
          {ownerInitials}
        </div>
        <span className="text-xs text-gray-600">{garden.owner.name || 'Gardener'}</span>
      </div>

      {/* Zones + crops */}
      <div className="p-4">
        {/* Zones */}
        <div className="flex flex-wrap gap-1 mb-3">
          {garden.zones.slice(0, 4).map((zone) => (
            <span
              key={zone.id}
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${zoneTypeColors[zone.type] ?? 'bg-gray-100 text-gray-700'}`}
            >
              {zone.name}
            </span>
          ))}
          {garden.zones.length > 4 && (
            <span className="text-xs text-gray-400 px-1">+{garden.zones.length - 4}</span>
          )}
        </div>

        {/* Top crops */}
        {garden.topCrops.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {garden.topCrops.map((crop) => (
              <span
                key={crop}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded"
              >
                {crop}
              </span>
            ))}
            {garden.cropCount > 5 && (
              <span className="text-xs text-gray-400 px-1">+{garden.cropCount - 5}</span>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 italic">No crops yet</p>
        )}
      </div>
    </Link>
  );
}
