'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { GardenCanvas } from '@/components/garden/GardenCanvas';
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

  const canEdit = role === 'owner' || role === 'editor';
  const isOwner = role === 'owner';

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

  const handleViewCrop = (cropId: string) => {
    console.log('View crop:', cropId);
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                ← Back
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="font-semibold text-gray-900">{gardenName}</h1>
              {isPublic && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                  Public
                </span>
              )}
              {!isOwner && role === 'viewer' && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                  Viewer
                </span>
              )}
              {!isOwner && role === 'editor' && (
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                  Editor
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {(isOwner || role === 'editor') && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Garden settings"
                >
                  ⚙️ Settings
                </button>
              )}
              <Link
                href={`/calendar/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📅 Calendar
              </Link>
              <Link
                href={`/analytics/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📊 Analytics
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">Failed to load garden</div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setShowSettings(false)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-gray-900">Garden Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Public toggle — owner only */}
            {isOwner && (
              <div className="mb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 text-sm">Share publicly</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Make this garden visible to everyone on the discover page
                    </div>
                  </div>
                  <button
                    onClick={handleTogglePublic}
                    disabled={togglingPublic}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ml-3
                      ${isPublic ? 'bg-green-500' : 'bg-gray-300'}`}
                    role="switch"
                    aria-checked={isPublic}
                    aria-label="Toggle public visibility"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform
                        ${isPublic ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
                {isPublic && (
                  <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="text-xs text-green-700 font-medium mb-1">Public link</div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={publicUrl}
                        className="flex-1 text-xs bg-white border border-green-200 rounded px-2 py-1 text-gray-700 truncate"
                        onClick={(e) => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        onClick={() => navigator.clipboard.writeText(publicUrl)}
                        className="text-xs text-green-700 font-medium hover:text-green-800 whitespace-nowrap"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Collaborators — owner only */}
            {isOwner && (
              <div className="border-t border-gray-100 pt-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-3">Collaborators</h3>

                {/* Pending invites */}
                {pendingInvites.length > 0 && (
                  <div className="mb-3 space-y-2">
                    <div className="text-xs text-gray-500 font-medium">Pending invites</div>
                    {pendingInvites.map((invite) => (
                      <div
                        key={invite.id}
                        className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2"
                      >
                        <div>
                          <div className="text-xs font-medium text-gray-700">{invite.email}</div>
                          <div className="text-xs text-gray-400">
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
                          <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                            {collab.user.name?.[0]?.toUpperCase() ??
                              collab.user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-gray-700">
                              {collab.user.name || collab.user.email}
                            </div>
                            <div className="text-xs text-gray-400">{collab.user.email}</div>
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
                            className="text-xs border border-gray-200 rounded px-2 py-1 text-gray-600 bg-white"
                          >
                            <option value="EDITOR">Editor</option>
                            <option value="VIEWER">Viewer</option>
                          </select>
                          <button
                            onClick={() => handleRemoveCollaborator(collab.user.id)}
                            disabled={removingCollaborator === collab.user.id}
                            className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Invite form */}
                <form onSubmit={handleInvite} className="flex gap-2">
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@email.com"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-green-500"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'EDITOR' | 'VIEWER')}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-600 bg-white"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={sendingInvite || !inviteEmail.trim()}
                    className="text-sm bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-500 disabled:opacity-50 transition-colors"
                  >
                    {sendingInvite ? '...' : 'Invite'}
                  </button>
                </form>
                {inviteSuccess && (
                  <div className="mt-2 text-xs text-green-600">{inviteSuccess}</div>
                )}
                {inviteError && <div className="mt-2 text-xs text-red-500">{inviteError}</div>}
              </div>
            )}

            {/* Role info — non-owner */}
            {!isOwner && (
              <div className="border-t border-gray-100 pt-4">
                <div className="text-sm text-gray-600">
                  You are an <span className="font-medium capitalize">{role}</span> of this garden.
                </div>
                {role === 'viewer' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Viewers have read-only access. Contact the owner to request edit access.
                  </div>
                )}
                {role === 'editor' && (
                  <div className="text-xs text-gray-400 mt-1">
                    Editors can add zones, plots, and crops. Only the owner can manage collaborators
                    or delete the garden.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-100 mt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Done
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
    </div>
  );
}
