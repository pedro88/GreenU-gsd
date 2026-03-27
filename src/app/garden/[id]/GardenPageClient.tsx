'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { GardenCanvas } from '@/components/garden/GardenCanvas';
import { XPToast } from '@/components/ui/XPToast';
import { AddZoneDialog, AddPlotDialog, AddCropDialog } from '@/components/garden/GardenDialogs';
import {
  useGetGardenVisualizationQuery,
  useCreateZoneMutation,
  useCreatePlotMutation,
  useCreateCropMutation,
  useDeleteZoneMutation,
} from '@/store/api/gardenVisualizationApi';

interface GardenPageClientProps {
  gardenId: string;
  gardenName: string;
  isPublic: boolean;
  role: 'owner' | 'editor' | 'viewer';
  plants: Array<{ id: string; name: string; family: string }>;
}

/**
 * Main client component for the garden visualization page.
 * Manages garden canvas rendering, CRUD dialogs (zones, plots, crops), and garden settings.
 * Handles collaborator management for garden owners and public visibility toggling.
 * @param props - Garden page initialization data
 * @param props.gardenId - ID of the garden to display
 * @param props.gardenName - Display name of the garden
 * @param props.isPublic - Whether the garden is publicly visible
 * @param props.role - Current user's permission role (owner, editor, or viewer)
 * @param props.plants - Available plant types for the crop planting dialog
 * @returns The full garden page with canvas, header, settings panel, and dialogs
 */
export function GardenPageClient({
  gardenId,
  gardenName,
  isPublic: initialPublic,
  role,
  plants,
}: GardenPageClientProps) {
  const [showAddZone, setShowAddZone] = useState(false);
  const [addPlotTarget, setAddPlotTarget] = useState<{ zoneId: string; zoneName: string } | null>(
    null
  );
  const [addCropTarget, setAddCropTarget] = useState<{ plotId: string; plotName: string } | null>(
    null
  );
  const [showSettings, setShowSettings] = useState(false);
  const [isPublic, setIsPublic] = useState(initialPublic);
  const [togglingPublic, setTogglingPublic] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'EDITOR' | 'VIEWER'>('EDITOR');
  const [sendingInvite, setSendingInvite] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [collaborators, setCollaborators] = useState<
    Array<{ id: string; user: { id: string; name: string | null; email: string }; role: string }>
  >([]);
  const [pendingInvites, setPendingInvites] = useState<
    Array<{ id: string; email: string; role: string; expiresAt: string }>
  >([]);
  const [changingRole, setChangingRole] = useState<string | null>(null);
  const [removingCollaborator, setRemovingCollaborator] = useState<string | null>(null);

  // XP Toast state
  const [xpToast, setXpToast] = useState<{
    visible: boolean;
    xp?: number;
    level?: number;
    previousLevel?: number;
    type: 'xp' | 'levelup' | 'achievement';
    achievementName?: string;
    achievementIcon?: string;
  }>({ visible: false, type: 'xp' });

  const canEdit = role === 'owner' || role === 'editor';
  const isOwner = role === 'owner';

  const handleXpChange = useCallback(
    (xp: number, leveledUp: boolean, newLevel: number, prevLevel: number) => {
      if (xp > 0) {
        setXpToast({
          visible: true,
          type: leveledUp ? 'levelup' : 'xp',
          xp,
          level: newLevel,
          previousLevel: prevLevel,
        });
      }
    },
    []
  );

  const { data, isLoading } = useGetGardenVisualizationQuery(gardenId);
  const [createZone] = useCreateZoneMutation();
  const [createPlot] = useCreatePlotMutation();
  const [createCrop] = useCreateCropMutation();
  const [deleteZone] = useDeleteZoneMutation();

  const handleCreateZone = async (name: string, type: string) => {
    await createZone({ gardenId, name, type });
  };

  const handleCreatePlot = async (name: string, sizeSqFt?: number, soilType?: string) => {
    if (!addPlotTarget) return;
    await createPlot({
      zoneId: addPlotTarget.zoneId,
      gardenId,
      name,
      sizeSqFt,
      soilType,
    });
  };

  const handleCreateCrop = async (plantTypeId: string, plantedDate: string, quantity?: number) => {
    if (!addCropTarget) return;
    await createCrop({
      plotId: addCropTarget.plotId,
      gardenId,
      plantTypeId,
      plantedDate,
      quantity,
    });
  };

  const handleDeleteZone = async (zoneId: string) => {
    await deleteZone({ zoneId, gardenId });
  };

  const handleTogglePublic = async () => {
    setTogglingPublic(true);
    try {
      const res = await fetch(`/api/gardens/${gardenId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !isPublic }),
      });
      if (res.ok) {
        setIsPublic(!isPublic);
      }
    } catch {
      // silently fail — user can try again
    } finally {
      setTogglingPublic(false);
    }
  };

  const handleViewCrop = (_cropId: string) => {
    // future: open crop detail dialog
  };

  // Fetch collaborators and invites when settings panel opens (owner only)
  useEffect(() => {
    if (!showSettings || !isOwner) return;

    /**
     * Fetches the list of collaborators and pending invites for the garden from the API.
     * Populates the collaborators and pendingInvites state variables on success.
     */
    async function fetchCollaborators() {
      try {
        const [accessRes, inviteRes] = await Promise.all([
          fetch(`/api/gardens/${gardenId}/access`),
          fetch(`/api/gardens/${gardenId}/invite`),
        ]);
        if (accessRes.ok) {
          const data = await accessRes.json();
          setCollaborators(data);
        }
        if (inviteRes.ok) {
          const data = await inviteRes.json();
          setPendingInvites(data);
        }
      } catch {
        // ignore
      }
    }
    fetchCollaborators();
  }, [showSettings, gardenId, isOwner]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSendingInvite(true);
    setInviteSuccess('');
    setInviteError('');
    try {
      const res = await fetch(`/api/gardens/${gardenId}/invite`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      if (res.ok) {
        setInviteSuccess('Invite sent!');
        setInviteEmail('');
        // Refresh invites list
        const inviteRes = await fetch(`/api/gardens/${gardenId}/invite`);
        if (inviteRes.ok) setPendingInvites(await inviteRes.json());
      } else {
        const err = await res.json();
        setInviteError(err.error || 'Failed to send invite');
      }
    } catch {
      setInviteError('Failed to send invite');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: 'EDITOR' | 'VIEWER') => {
    setChangingRole(userId);
    try {
      const res = await fetch(`/api/gardens/${gardenId}/access/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        const updated = await res.json();
        setCollaborators((prev) =>
          prev.map((c) => (c.user.id === updated.user.id ? { ...c, role: newRole } : c))
        );
      }
    } catch {
      // ignore
    } finally {
      setChangingRole(null);
    }
  };

  const handleRemoveCollaborator = async (userId: string) => {
    setRemovingCollaborator(userId);
    try {
      const res = await fetch(`/api/gardens/${gardenId}/access/${userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setCollaborators((prev) => prev.filter((c) => c.user.id !== userId));
      }
    } catch {
      // ignore
    } finally {
      setRemovingCollaborator(null);
    }
  };

  const publicUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/gardens/${gardenId}`
      : `/gardens/${gardenId}`;

  return (
    <div className="min-h-screen">
      {/* Header bar */}
      <div className="retro-nav sticky top-14 z-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="font-pixel text-xs font-semibold text-ink-500 hover:text-ink-800 transition-colors tracking-wide"
              >
                ← BACK
              </Link>
              <span className="text-ink-300 font-pixel text-xs">◆</span>
              <h1 className="font-pixel text-sm font-bold text-ink-900 tracking-wide">
                {gardenName}
              </h1>
              {isPublic && <span className="pixel-badge pixel-badge-green">PUBLIC</span>}
              {!isOwner && role === 'viewer' && (
                <span className="pixel-badge" style={{ background: '#E8DFD0', color: '#5C4B26' }}>
                  VIEWER
                </span>
              )}
              {!isOwner && role === 'editor' && (
                <span className="pixel-badge pixel-badge-cream">EDITOR</span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              {(isOwner || role === 'editor') && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 transition-colors"
                  style={{ boxShadow: '2px 2px 0px #302818' }}
                  title="Garden settings"
                >
                  ⚙️ SETTINGS
                </button>
              )}
              <Link
                href={`/calendar/${gardenId}`}
                className="font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 transition-colors"
                style={{ boxShadow: '2px 2px 0px #302818' }}
              >
                📅 CALENDAR
              </Link>
              <Link
                href={`/analytics/${gardenId}`}
                className="font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 transition-colors"
                style={{ boxShadow: '2px 2px 0px #302818' }}
              >
                📊 STATS
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {data ? (
          <GardenCanvas
            data={data}
            isLoading={isLoading}
            canEdit={canEdit}
            onAddZone={() => setShowAddZone(true)}
            onAddPlot={(zoneId) => {
              const zone = data.zones.find((z) => z.id === zoneId);
              if (zone) setAddPlotTarget({ zoneId, zoneName: zone.name });
            }}
            onDeleteZone={handleDeleteZone}
            onAddCrop={(plotId) => {
              for (const zone of data.zones) {
                const plot = zone.plots.find((p) => p.id === plotId);
                if (plot) {
                  setAddCropTarget({ plotId, plotName: plot.name });
                  break;
                }
              }
            }}
            onViewCrop={handleViewCrop}
          />
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="font-pixel text-sm text-ink-500 tracking-widest animate-pulse">
              LOADING GARDEN...
            </div>
            <div className="pixel-card-inset p-4 w-48 text-center font-pixel text-xs text-ink-400">
              ████████░░░░░░░░
            </div>
          </div>
        ) : (
          <div className="pixel-card p-8 text-center">
            <p className="font-pixel text-sm text-ink-500">Failed to load garden</p>
            <p className="font-pixel text-xs text-ink-300 mt-2">
              Check your connection and try again
            </p>
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-ink-900/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="retro-dialog rounded-lg p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-pixel text-sm font-bold text-ink-900 tracking-wide uppercase">
                ⚙ Garden Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="font-pixel text-xs text-ink-500 hover:text-ink-800 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Public toggle — owner only */}
            {isOwner && (
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-pixel text-xs font-bold text-ink-800">Share Publicly</div>
                    <div className="font-body text-xs text-ink-400 mt-0.5 leading-relaxed">
                      Make this garden visible on the discover page
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePublic}
                    disabled={togglingPublic}
                    className={`pixel-toggle ml-3 ${isPublic ? 'active' : ''}`}
                    role="switch"
                    aria-checked={isPublic}
                    aria-label="Toggle public visibility"
                  />
                </div>
                {isPublic && (
                  <div className="mt-3 pixel-card-inset p-3">
                    <div className="font-pixel text-[10px] font-bold text-ink-600 mb-1 tracking-widest">
                      PUBLIC LINK
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publicUrl}
                        className="flex-1 pixel-input text-xs"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(publicUrl)}
                        className="btn-pixel btn-pixel-sm btn-pixel-ghost"
                      >
                        COPY
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collaborators — owner only */}
            {isOwner && (
              <div className="border-t-[2px] border-ink-300 pt-4">
                <h3 className="font-pixel text-xs font-bold text-ink-800 mb-3 tracking-wide">
                  COLLABORATORS
                </h3>

                {/* Pending invites */}
                {pendingInvites.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <div className="font-pixel text-[10px] text-ink-400 font-bold tracking-widest">
                      PENDING INVITES
                    </div>
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="pixel-card-inset flex items-center justify-between px-3 py-2"
                      >
                        <div>
                          <div className="font-body text-xs font-semibold text-ink-800">
                            {invite.email}
                          </div>
                          <div className="font-mono text-[10px] text-ink-400 mt-0.5">
                            {invite.role} · expires{' '}
                            {new Date(invite.expiresAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Collaborator list */}
                {collaborators.length > 0 && (
                  <div className="mb-3 space-y-2">
                    {collaborators.map((collab) => (
                      <div key={collab.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 flex items-center justify-center font-pixel text-xs font-bold border-[2px] border-ink-700"
                            style={{ background: '#FFCC4D' }}
                          >
                            {collab.user.name?.[0]?.toUpperCase() ??
                              collab.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-body text-xs font-semibold text-ink-800">
                              {collab.user.name || collab.user.email}
                            </div>
                            <div className="font-body text-[10px] text-ink-400">
                              {collab.user.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={collab.role}
                            onChange={(e) =>
                              handleChangeRole(
                                collab.user.id,
                                e.target.value as 'EDITOR' | 'VIEWER'
                              )
                            }
                            disabled={changingRole === collab.user.id}
                            className="pixel-input text-xs py-1 w-20"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.user.id)}
                            disabled={removingCollaborator === collab.user.id}
                            className="font-pixel text-xs text-ink-400 hover:text-terracotta-600 transition-colors px-1"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Invite form */}
                <form onSubmit={handleInvite} className="flex flex-col gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@email.com"
                    className="pixel-input text-sm"
                  />
                  <div className="flex gap-2">
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')}
                      className="pixel-input text-xs py-2 flex-1"
                    >
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    <button
                      type="submit"
                      disabled={sendingInvite || !inviteEmail.trim()}
                      className="btn-pixel btn-pixel-secondary btn-pixel-sm"
                    >
                      {sendingInvite ? '...' : 'INVITE'}
                    </button>
                  </div>
                </form>
                {inviteSuccess && (
                  <div className="mt-2 font-pixel text-xs text-forest-600 font-bold tracking-wide">
                    ✓ {inviteSuccess}
                  </div>
                )}
                {inviteError && (
                  <div className="mt-2 font-pixel text-xs text-terracotta-700 font-bold tracking-wide">
                    ⚠ {inviteError}
                  </div>
                )}
              </div>
            )}

            {/* Role info — non-owner */}
            {!isOwner && (
              <div className="border-t-[2px] border-ink-300 pt-4">
                <div className="font-body text-sm text-ink-600">
                  You are an{' '}
                  <span className="font-pixel font-bold text-terracotta-600 uppercase tracking-wide">
                    {role}
                  </span>{' '}
                  of this garden.
                </div>
                {role === 'viewer' && (
                  <div className="font-body text-xs text-ink-400 mt-1">
                    Viewers have read-only access. Contact the owner to request edit access.
                  </div>
                )}
                {role === 'editor' && (
                  <div className="font-body text-xs text-ink-400 mt-1">
                    Editors can add zones, plots, and crops. Only the owner can manage collaborators
                    or delete the garden.
                  </div>
                )}
              </div>
            )}

            {/* Done button */}
            <div className="flex justify-end pt-4 border-t-[2px] border-ink-300 mt-4">
              <button onClick={() => setShowSettings(false)} className="btn-pixel btn-pixel-sm">
                DONE ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddZoneDialog
        open={showAddZone}
        onClose={() => setShowAddZone(false)}
        onSubmit={handleCreateZone}
      />

      {addPlotTarget && (
        <AddPlotDialog
          open={true}
          zoneName={addPlotTarget.zoneName}
          onClose={() => setAddPlotTarget(null)}
          onSubmit={handleCreatePlot}
        />
      )}

      {addCropTarget && (
        <AddCropDialog
          open={true}
          plotName={addCropTarget.plotName}
          gardenId={gardenId}
          plants={plants}
          onClose={() => setAddCropTarget(null)}
          onSubmit={handleCreateCrop}
        />
      )}

      {/* XP / Achievement Toast */}
      <XPToast
        visible={xpToast.visible}
        type={xpToast.type}
        xp={xpToast.xp}
        level={xpToast.level}
        previousLevel={xpToast.previousLevel}
        achievementName={xpToast.achievementName}
        achievementIcon={xpToast.achievementIcon}
        onClose={() => setXpToast((t) => ({ ...t, visible: false }))}
      />

      {/* Poll for XP + achievement changes */}
      <XpPoller
        gardenId={gardenId}
        onXpChange={handleXpChange}
        onAchievementUnlock={(name, icon, xp) => {
          setXpToast({
            visible: true,
            type: 'achievement',
            achievementName: name,
            achievementIcon: icon,
            xp,
          });
        }}
      />
    </div>
  );
}

interface XpPollerProps {
  gardenId: string;
  onXpChange: (xp: number, leveledUp: boolean, newLevel: number, prevLevel: number) => void;
  onAchievementUnlock: (name: string, icon: string, xp: number) => void;
}

/**
 * Polls game-stats and achievements APIs every 3 seconds while on the garden page
 * to detect XP changes and new achievement unlocks, triggering toasts.
 * @param props.gardenId - Garden ID (passed through for tracking)
 * @param root0
 * @param root0.gardenId
 * @param props.onXpChange - Callback fired when XP changes are detected
 * @param root0.onXpChange
 * @param props.onAchievementUnlock - Callback fired when a new achievement unlocks
 * @param root0.onAchievementUnlock
 * @returns null
 */
function XpPoller({ gardenId: _gardenId, onXpChange, onAchievementUnlock }: XpPollerProps) {
  const [lastXp, setLastXp] = useState<number | null>(null);
  const [lastAchievementCount, setLastAchievementCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    /**
     *
     */
    async function poll() {
      try {
        // Poll XP
        const statsRes = await fetch('/api/profile/game-stats');
        if (statsRes.ok) {
          const data = await statsRes.json();
          if (lastXp !== null && data.totalXp > lastXp) {
            const gained = data.totalXp - lastXp;
            const leveledUp = data.level > (lastXp > 0 ? Math.floor(Math.sqrt(lastXp / 100)) : 1);
            const prevLevel = Math.floor(Math.sqrt(lastXp / 100));
            if (!cancelled) onXpChange(gained, leveledUp, data.level, prevLevel);
          }
          if (!cancelled) setLastXp(data.totalXp);
        }

        // Poll achievements
        const achRes = await fetch('/api/achievements');
        if (achRes.ok) {
          const achievements = await achRes.json();
          const unlockedCount = achievements.filter(
            (a: { unlocked: boolean }) => a.unlocked
          ).length;
          if (lastAchievementCount !== null && unlockedCount > lastAchievementCount) {
            // Find the newly unlocked achievement
            const newOnes = achievements.filter(
              (a: { unlocked: boolean; unlockedAt: string | null }) =>
                a.unlocked && a.unlockedAt && Date.now() - new Date(a.unlockedAt).getTime() < 10000
            );
            if (newOnes.length > 0 && !cancelled) {
              const newest = newOnes[newOnes.length - 1];
              onAchievementUnlock(newest.name, newest.icon, newest.xpReward);
            }
          }
          if (!cancelled) setLastAchievementCount(unlockedCount);
        }
      } catch {
        // ignore polling errors
      }
    }

    // Initial fetch
    poll();
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [lastXp, lastAchievementCount, onXpChange, onAchievementUnlock]);

  return null;
}
