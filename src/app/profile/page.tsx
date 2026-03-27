'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LanguageSelector } from '@/components/LanguageSelector';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  language: string;
  latitude: number | null;
  longitude: number | null;
  followerCount: number;
  followingCount: number;
  createdAt: string;
}

interface GameStats {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  progress: {
    xpInLevel: number;
    xpForNextLevel: number;
    percent: number;
  };
}

interface Garden {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  zones: unknown[];
  createdAt: string;
}

/**
 * User profile page with garden management, location settings, and language preferences.
 * Protected route requiring authentication.
 * @returns The profile page JSX
 */
export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);
  const [showNewGarden, setShowNewGarden] = useState(false);
  const [newGardenName, setNewGardenName] = useState('');
  const [creatingGarden, setCreatingGarden] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    /**
     * Fetches the user profile data from the API.
     */
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
      } finally {
        setLoading(false);
      }
    }

    /**
     * Fetches the user's garden list from the API.
     */
    async function fetchGardens() {
      try {
        const response = await fetch('/api/gardens');
        if (response.ok) {
          const data = await response.json();
          setGardens(data);
        }
      } catch (error) {
        console.error('Failed to fetch gardens:', error);
      }
    }

    /**
     * Fetches the user's gamification stats (XP, level, streak) from the API.
     */
    async function fetchGameStats() {
      try {
        const response = await fetch('/api/profile/game-stats');
        if (response.ok) {
          const data = await response.json();
          setGameStats(data);
        }
      } catch (error) {
        console.error('Failed to fetch game stats:', error);
      }
    }

    if (session?.user) {
      fetchProfile();
      fetchGardens();
      fetchGameStats();
    }
  }, [session]);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleCreateGarden = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGardenName.trim()) return;
    setCreatingGarden(true);
    try {
      const response = await fetch('/api/gardens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGardenName.trim() }),
      });
      if (response.ok) {
        const garden = await response.json();
        setGardens((prev) => [...prev, { ...garden, zones: [] }]);
        setNewGardenName('');
        setShowNewGarden(false);
        // Redirect to the new garden
        router.push(`/garden/${garden.id}`);
      }
    } catch (error) {
      console.error('Failed to create garden:', error);
    } finally {
      setCreatingGarden(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-4"
          style={{ borderColor: '#FF5526', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  const initials =
    profile?.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    profile?.email?.[0].toUpperCase() ||
    '?';

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="pixel-heading-lg" style={{ color: '#302818' }}>
          Profile
        </h1>
        <button
          onClick={handleSignOut}
          className="btn-pixel-secondary px-4 py-2 text-sm font-bold font-pixel"
        >
          Sign Out
        </button>
      </div>

      {/* Game Stats — XP Bar */}
      {gameStats && (
        <div
          className="pixel-card mb-8"
          style={{ background: 'linear-gradient(135deg, #302818 0%, #4A3728 100%)' }}
        >
          <div className="flex items-center gap-4 mb-3">
            {/* Level badge */}
            <div
              className="flex items-center justify-center w-14 h-14 font-pixel text-xl font-bold border-[3px] border-ink-800"
              style={{ background: '#FFCC4D', boxShadow: '3px 3px 0px #302818' }}
            >
              {gameStats.level}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-pixel text-xs font-bold text-cream-100 tracking-widest">
                  LVL {gameStats.level}
                </span>
                <span className="font-pixel text-xs text-cream-200">
                  {gameStats.progress.xpInLevel} / {gameStats.progress.xpForNextLevel} XP
                </span>
              </div>
              {/* XP progress bar */}
              <div
                className="h-4 border-[2px] border-ink-800 relative overflow-hidden"
                style={{ background: '#5C4B26' }}
              >
                <div
                  className="h-full transition-all duration-500"
                  style={{
                    width: `${gameStats.progress.percent}%`,
                    background: 'linear-gradient(90deg, #CC6B47 0%, #FF7755 100%)',
                  }}
                />
                {/* Pixel pattern overlay */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(0,0,0,0.15) 8px, rgba(0,0,0,0.15) 16px)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Streak + XP total */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <span className="font-pixel text-xs font-bold text-cream-100">
                {gameStats.currentStreak} day streak
              </span>
              {gameStats.currentStreak > 1 && (
                <span className="font-pixel text-xs text-cream-300">
                  (best: {gameStats.longestStreak})
                </span>
              )}
            </div>
            <div className="font-pixel text-xs text-cream-200">
              Total: <span className="text-terracotta-300 font-bold">{gameStats.totalXp}</span> XP
            </div>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="pixel-card mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full font-bold text-xl font-pixel"
              style={{ backgroundColor: '#FF5526', color: '#FFF8E7' }}
            >
              {initials}
            </div>
            <div>
              <h2 className="pixel-heading" style={{ color: '#302818' }}>
                {profile?.name || 'No name set'}
              </h2>
              <p className="pixel-label" style={{ color: '#302818' }}>
                {profile?.email}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-center">
            <div>
              <div className="pixel-heading" style={{ color: '#302818' }}>
                {profile?.followerCount ?? 0}
              </div>
              <div className="pixel-label" style={{ color: '#302818' }}>
                Followers
              </div>
            </div>
            <div>
              <div className="pixel-heading" style={{ color: '#302818' }}>
                {profile?.followingCount ?? 0}
              </div>
              <div className="pixel-label" style={{ color: '#302818' }}>
                Following
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 pixel-divider">
          <Link
            href="/discover"
            className="text-sm font-bold font-pixel"
            style={{ color: '#2D8A2D' }}
          >
            Browse discover →
          </Link>
        </div>
      </div>

      {/* My Gardens */}
      <div className="pixel-card mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="pixel-heading" style={{ color: '#302818' }}>
            My Gardens
          </h3>
          <button
            onClick={() => setShowNewGarden(true)}
            className="btn-pixel-primary px-3 py-1.5 text-sm font-bold font-pixel"
          >
            + New garden
          </button>
        </div>

        {showNewGarden && (
          <form onSubmit={handleCreateGarden} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newGardenName}
              onChange={(e) => setNewGardenName(e.target.value)}
              placeholder="Garden name (e.g., Backyard Garden)"
              className="pixel-input flex-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={creatingGarden || !newGardenName.trim()}
              className="btn-pixel-primary px-4 py-2 text-sm font-bold font-pixel"
            >
              {creatingGarden ? 'Creating...' : 'Create'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowNewGarden(false);
                setNewGardenName('');
              }}
              className="btn-pixel-ghost px-3 py-2 text-sm font-bold font-pixel"
            >
              Cancel
            </button>
          </form>
        )}

        {gardens.length === 0 && !showNewGarden ? (
          <div className="text-center py-8 font-pixel">
            <div className="text-3xl mb-2">🌱</div>
            <p className="pixel-label mb-3" style={{ color: '#302818' }}>
              No gardens yet. Create your first garden to get started.
            </p>
            <button
              onClick={() => setShowNewGarden(true)}
              className="btn-pixel-primary px-4 py-2 text-sm font-bold font-pixel"
            >
              Create your first garden
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {gardens.map((garden) => (
              <li key={garden.id}>
                <Link
                  href={`/garden/${garden.id}`}
                  className="flex items-center justify-between p-3 hover:opacity-80 transition-colors group"
                >
                  <div>
                    <div
                      className="font-bold font-pixel group-hover:text-green-600 transition-colors"
                      style={{ color: '#302818' }}
                    >
                      {garden.name}
                    </div>
                    <div className="pixel-label" style={{ color: '#302818' }}>
                      {garden.zones.length} zone{garden.zones.length !== 1 ? 's' : ''}
                      {garden.location && ` · ${garden.location}`}
                    </div>
                  </div>
                  <span className="font-bold" style={{ color: '#2D8A2D' }}>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Account Info */}
      <div className="pixel-card mb-8">
        <h3 className="pixel-heading mb-4" style={{ color: '#302818' }}>
          Account Information
        </h3>
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="pixel-label" style={{ color: '#302818' }}>
              Name
            </dt>
            <dd className="font-bold font-pixel" style={{ color: '#302818' }}>
              {profile?.name || (
                <span className="pixel-label" style={{ color: '#302818' }}>
                  Not set
                </span>
              )}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="pixel-label" style={{ color: '#302818' }}>
              Email
            </dt>
            <dd className="font-bold font-pixel" style={{ color: '#302818' }}>
              {profile?.email}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="pixel-label" style={{ color: '#302818' }}>
              Member since
            </dt>
            <dd className="font-bold font-pixel" style={{ color: '#302818' }}>
              {profile?.createdAt
                ? new Date(profile.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })
                : '-'}
            </dd>
          </div>
        </dl>
      </div>

      {/* Language & Location Settings */}
      <div className="pixel-card">
        <h3 className="pixel-heading mb-4" style={{ color: '#302818' }}>
          Language Settings
        </h3>
        <div className="mb-6">
          <LanguageSelector />
        </div>

        <h3 className="pixel-heading mb-4" style={{ color: '#302818' }}>
          Location Settings
        </h3>
        <p className="pixel-label mb-4" style={{ color: '#302818' }}>
          Set your location to get personalized planting recommendations based on your local
          climate.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setSavingLocation(true);
            setLocationSuccess(false);
            const formData = new FormData(e.currentTarget);
            try {
              const response = await fetch('/api/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  latitude: formData.get('latitude')
                    ? parseFloat(formData.get('latitude') as string)
                    : null,
                  longitude: formData.get('longitude')
                    ? parseFloat(formData.get('longitude') as string)
                    : null,
                }),
              });
              if (response.ok) {
                setLocationSuccess(true);
                const updated = await response.json();
                setProfile((prev) =>
                  prev
                    ? { ...prev, latitude: updated.latitude, longitude: updated.longitude }
                    : prev
                );
              }
            } catch (error) {
              console.error('Failed to save location:', error);
            } finally {
              setSavingLocation(false);
            }
          }}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="latitude"
                className="pixel-label block mb-1"
                style={{ color: '#302818' }}
              >
                Latitude
              </label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                step="any"
                min="-90"
                max="90"
                defaultValue={profile?.latitude ?? ''}
                placeholder="e.g., 45.5017"
                className="pixel-input w-full"
              />
            </div>
            <div>
              <label
                htmlFor="longitude"
                className="pixel-label block mb-1"
                style={{ color: '#302818' }}
              >
                Longitude
              </label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                step="any"
                min="-180"
                max="180"
                defaultValue={profile?.longitude ?? ''}
                placeholder="e.g., -73.5673"
                className="pixel-input w-full"
              />
            </div>
          </div>

          {profile?.latitude && profile?.longitude && (
            <p className="pixel-label" style={{ color: '#302818' }}>
              Current location: {profile.latitude.toFixed(4)}°, {profile.longitude.toFixed(4)}°
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={savingLocation}
              className="btn-pixel-primary px-4 py-2 text-sm font-bold font-pixel"
            >
              {savingLocation ? 'Saving...' : 'Save Location'}
            </button>
            {locationSuccess && (
              <span className="text-sm font-bold font-pixel" style={{ color: '#2D8A2D' }}>
                Location updated!
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
