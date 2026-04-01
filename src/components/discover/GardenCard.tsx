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
 * @param root0 - Destructured props object
 * @param root0.garden - The garden data to display
 * @param root0.followingIds - Set of user IDs that the current user follows
 * @param root0.onFollow - Callback when follow button is clicked
 * @returns The garden card component
 */
export function GardenCard({ garden, followingIds, onFollow }: GardenCardProps) {
  const [following, setFollowing] = useState(followingIds.has(garden.owner.id));
  const [loading, setLoading] = useState(false);

  const ownerInitials =
    garden.owner.name
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
      href={`/gardens/public/${garden.id}`}
      className="block pixel-card hover:shadow-lg transition-all group"
    >
      {/* Header */}
      <div className="p-4 pb-3 border-b" style={{ borderColor: '#302818' }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="font-bold font-pixel truncate group-hover:text-green-600 transition-colors"
              style={{ color: '#302818' }}
            >
              {garden.name}
            </h3>
            {garden.location && (
              <p className="pixel-label mt-0.5 truncate" style={{ color: '#302818' }}>
                {garden.location}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="pixel-badge-green font-pixel text-xs flex items-center gap-1">
              <span>👥</span>
              <span>{garden.followerCount}</span>
            </div>
            {garden.owner.id && (
              <button
                onClick={handleFollow}
                disabled={loading}
                className={`btn-pixel-sm
                  ${following ? 'btn-pixel-secondary' : 'btn-pixel-primary'}`}
              >
                {loading ? '...' : following ? 'Following' : '+ Follow'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Owner row */}
      <div
        className="px-4 py-2 border-b flex items-center gap-2"
        style={{ backgroundColor: '#302818', borderColor: '#302818' }}
      >
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full font-bold text-[10px] font-pixel"
          style={{ backgroundColor: '#FFCC4D', color: '#302818' }}
        >
          {ownerInitials}
        </div>
        <span className="pixel-label" style={{ color: '#FFF8E7' }}>
          {garden.owner.name || 'Gardener'}
        </span>
      </div>

      {/* Zones + crops */}
      <div className="p-4">
        {/* Zones */}
        <div className="flex flex-wrap gap-1 mb-3">
          {garden.zones.slice(0, 4).map((zone) => (
            <span
              key={zone.id}
              className={`text-xs px-2 py-0.5 rounded font-pixel ${zoneTypeColors[zone.type] ?? 'pixel-badge'}`}
            >
              {zone.name}
            </span>
          ))}
          {garden.zones.length > 4 && (
            <span className="text-xs px-1 font-pixel" style={{ color: '#302818' }}>
              +{garden.zones.length - 4}
            </span>
          )}
        </div>

        {/* Top crops */}
        {garden.topCrops.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {garden.topCrops.map((crop) => (
              <span key={crop} className="crop-pill">
                {crop}
              </span>
            ))}
            {garden.cropCount > 5 && (
              <span className="text-xs px-1 font-pixel" style={{ color: '#302818' }}>
                +{garden.cropCount - 5}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs italic font-pixel" style={{ color: '#302818' }}>
            No crops yet
          </p>
        )}
      </div>
    </Link>
  );
}
