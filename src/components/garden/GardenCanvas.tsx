'use client';

import { useState } from 'react';
import { ZoneBlock } from './ZoneBlock';
import { GardenVisualization } from '@/store/api/gardenVisualizationApi';

interface GardenCanvasProps {
  data: GardenVisualization;
  canEdit: boolean;
  onAddZone: () => void;
  onAddPlot: (zoneId: string) => void;
  onDeleteZone: (zoneId: string) => void;
  onAddCrop: (plotId: string) => void;
  onViewCrop: (cropId: string) => void;
  isLoading?: boolean;
}

/**
 * Main garden canvas component that renders all zones in a responsive grid layout.
 * Displays zone blocks with plots and crops, and handles zone deletion with confirmation.
 * @param props - Canvas rendering and interaction props
 * @param props.data - Garden visualization data containing all zones with their plots and crops
 * @param props.canEdit - Whether the current user has edit permissions for the garden
 * @param props.onAddZone - Callback invoked when the user clicks to add a new zone
 * @param props.onAddPlot - Callback invoked with a zoneId when adding a plot to a specific zone
 * @param props.onDeleteZone - Callback invoked with a zoneId when deleting a zone
 * @param props.onAddCrop - Callback invoked with a plotId when adding a crop to a specific plot
 * @param props.onViewCrop - Callback invoked with a cropId when viewing details of a crop
 * @param props.isLoading - Whether the garden data is currently loading (shows spinner when true)
 * @returns The rendered garden canvas with zones grid and optional empty state
 */
export function GardenCanvas({
  data,
  canEdit,
  onAddZone,
  onAddPlot,
  onDeleteZone,
  onAddCrop,
  onViewCrop,
  isLoading,
}: GardenCanvasProps) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const handleDeleteZone = (zoneId: string) => {
    setConfirmDelete(zoneId);
  };

  const confirmDeleteZone = () => {
    if (confirmDelete) {
      onDeleteZone(confirmDelete);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Confirmation dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-semibold text-gray-900 mb-2">Delete zone?</h3>
            <p className="text-sm text-gray-600 mb-4">
              This will permanently delete the zone and all its plots and crops.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteZone}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zones grid */}
      {data.zones.length === 0 ? (
        canEdit ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-gray-700 mb-1">Your garden is empty</h3>
            <p className="text-sm text-gray-400 mb-4">Add your first zone to start planning</p>
            <button
              onClick={onAddZone}
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors font-medium text-sm"
            >
              + Add first zone
            </button>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="font-semibold text-gray-700 mb-1">Garden has no zones yet</h3>
            <p className="text-sm text-gray-400">Check back later when the owner adds zones.</p>
          </div>
        )
      ) : (
        <>
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `repeat(${data.zoneGridCols}, 1fr)`,
            }}
          >
            {data.zones.map((zone) => (
              <ZoneBlock
                key={zone.id}
                zone={zone}
                canEdit={canEdit}
                onAddPlot={onAddPlot}
                onDeleteZone={handleDeleteZone}
                onAddCrop={onAddCrop}
                onViewCrop={onViewCrop}
              />
            ))}

            {canEdit && (
              <button
                onClick={onAddZone}
                className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50/50 transition-all min-h-[120px]"
              >
                <span className="text-2xl">+</span>
                <span className="text-sm font-medium">Add zone</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
