'use client';

import { useState } from 'react';
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
          <div className="retro-dialog bg-cream-50 border-4 border-ink-900 p-6 max-w-sm w-full">
            <h3 className="pixel-heading text-ink-900 mb-2">Delete zone?</h3>
            <p className="text-sm text-ink-500 mb-4">
              This will permanently delete the zone and all its plots and crops.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDelete(null)} className="btn-pixel btn-pixel-ghost">
                Cancel
              </button>
              <button onClick={confirmDeleteZone} className="btn-pixel btn-pixel-primary">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Zones grid */}
      {data.zones.length === 0 ? (
        canEdit ? (
          <div className="pixel-card-inset text-center py-16">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="pixel-heading text-ink-900 mb-1">Your garden is empty</h3>
            <p className="text-sm text-ink-400 mb-4">Add your first zone to start planning</p>
            <button onClick={onAddZone} className="btn-pixel btn-pixel-primary">
              + Add first zone
            </button>
          </div>
        ) : (
          <div className="pixel-card-inset text-center py-16">
            <div className="text-4xl mb-3">🌱</div>
            <h3 className="pixel-heading text-ink-900 mb-1">Garden has no zones yet</h3>
            <p className="text-sm text-ink-500">Check back later when the owner adds zones.</p>
          </div>
        )
      ) : (
        <>
          <div
            className="pixel-card-inset grid gap-4 p-4"
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
                className="zone-block btn-pixel flex flex-col items-center justify-center gap-2 text-ink-500 hover:text-forest-600 hover:border-forest-600 transition-all min-h-[120px]"
              >
                <span className="text-2xl">+</span>
                <span className="text-sm font-pixel">Add zone</span>
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

import { CropSummary, ZoneLayout } from '@/store/api/gardenVisualizationApi';

interface ZoneBlockProps {
  zone: ZoneLayout;
  canEdit: boolean;
  onAddPlot: (zoneId: string) => void;
  onDeleteZone: (zoneId: string) => void;
  onAddCrop: (plotId: string) => void;
  onViewCrop: (cropId: string) => void;
}

/**
 * Zone block that displays its plots in a grid layout with zone-specific styling.
 * @param root0 - Props object
 * @param root0.zone - Zone layout data containing plots
 * @param root0.canEdit - Whether the user can edit the zone
 * @param root0.onAddPlot - Callback when adding a new plot
 * @param root0.onDeleteZone - Callback when deleting the zone
 * @param root0.onAddCrop - Callback when adding a crop to a plot
 * @param root0.onViewCrop - Callback when viewing crop details
 * @returns The rendered zone block with plots grid
 */
export function ZoneBlock({
  zone,
  canEdit,
  onAddPlot,
  onDeleteZone,
  onAddCrop,
  onViewCrop,
}: ZoneBlockProps) {
  const zoneTypeStyles: Record<string, string> = {
    OUTDOOR: 'border-green-300 bg-green-50',
    GREENHOUSE: 'border-blue-300 bg-blue-50',
    ORCHARD: 'border-amber-300 bg-amber-50',
    INDOOR: 'border-purple-300 bg-purple-50',
    TERRACE: 'border-teal-300 bg-teal-50',
  };

  const typeIcons: Record<string, string> = {
    OUTDOOR: '🌱',
    GREENHOUSE: '🏠',
    ORCHARD: '🌳',
    INDOOR: '🪴',
    TERRACE: '🌿',
  };

  const style = zoneTypeStyles[zone.type] ?? zoneTypeStyles.OUTDOOR;

  return (
    <div className={`zone-block pixel-card flex flex-col gap-2 ${style}`} data-zone-id={zone.id}>
      {/* Zone header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-terracotta-600" aria-hidden>
            {typeIcons[zone.type] ?? '🌱'}
          </span>
          <h3 className="font-pixel text-ink-900 text-sm">{zone.name}</h3>
        </div>
        {canEdit && (
          <button
            onClick={() => onDeleteZone(zone.id)}
            className="btn-pixel-ghost text-xs text-ink-400 hover:text-terracotta-600 transition-colors px-1"
            title="Delete zone"
          >
            ✕
          </button>
        )}
      </div>

      {/* Plots grid */}
      {zone.plots.length === 0 ? (
        canEdit ? (
          <div className="flex-1 flex items-center justify-center">
            <button
              onClick={() => onAddPlot(zone.id)}
              className="btn-pixel btn-pixel-sm w-full py-3"
            >
              + Add plot
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-ink-400 font-pixel py-3">
            No plots yet
          </div>
        )
      ) : (
        <div
          className="grid gap-2 flex-1"
          style={{
            gridTemplateColumns: `repeat(${Math.min(zone.plots.length, 3)}, 1fr)`,
          }}
        >
          {zone.plots.map((plot) => (
            <PlotBlock
              key={plot.id}
              plotId={plot.id}
              name={plot.name}
              crops={plot.crops}
              canEdit={canEdit}
              onAddCrop={onAddCrop}
              onViewCrop={onViewCrop}
            />
          ))}
          {canEdit && (
            <button
              onClick={() => onAddPlot(zone.id)}
              className="btn-pixel btn-pixel-sm border-2 border-dashed border-ink-400 rounded-lg flex items-center justify-center text-ink-400 hover:border-forest-600 hover:text-forest-600 hover:bg-forest-600/10 transition-all text-xs py-2"
            >
              + Plot
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface PlotBlockProps {
  plotId: string;
  name: string;
  crops: CropSummary[];
  canEdit: boolean;
  onAddCrop: (plotId: string) => void;
  onViewCrop: (cropId: string) => void;
}

/**
 * Individual plot block within a zone that shows current crops with status indicators.
 * @param root0 - Props object
 * @param root0.plotId - Unique identifier for the plot
 * @param root0.name - Display name of the plot
 * @param root0.crops - Array of crop summaries in this plot
 * @param root0.canEdit - Whether the user can edit the plot
 * @param root0.onAddCrop - Callback when adding a new crop
 * @param root0.onViewCrop - Callback when viewing crop details
 * @returns The rendered plot block element
 */
export function PlotBlock({ plotId, name, crops, canEdit, onAddCrop, onViewCrop }: PlotBlockProps) {
  const statusColors: Record<string, string> = {
    PLANTED: 'bg-ink-400 text-cream-50',
    SEEDLING: 'bg-yellow-100 text-yellow-800',
    VEGETATIVE: 'bg-green-200 text-green-800',
    FLOWERING: 'bg-purple-100 text-purple-800',
    FRUITING: 'bg-orange-100 text-orange-800',
    HARVESTING: 'bg-forest-600/20 text-forest-600 border border-forest-600',
    HARVESTED: 'bg-forest-600/20 text-forest-600',
    FAILED: 'bg-terracotta-600/20 text-terracotta-600 border border-terracotta-600',
  };

  return (
    <div className="plot-block pixel-card-inset flex flex-col gap-1 min-h-[60px]">
      <span className="text-xs font-pixel text-ink-700 truncate">{name}</span>
      {crops.length === 0 ? (
        canEdit ? (
          <button
            onClick={() => onAddCrop(plotId)}
            className="flex-1 flex items-center justify-center text-xs text-ink-400 hover:text-forest-600 hover:bg-forest-600/10 rounded transition-colors min-h-[32px]"
          >
            + Add crop
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-ink-400 font-pixel min-h-[32px]">
            Empty
          </div>
        )
      ) : (
        <div className="flex flex-wrap gap-1">
          {crops.map((crop) => (
            <button
              key={crop.id}
              onClick={() => onViewCrop(crop.id)}
              title={`${crop.name} — ${crop.status}`}
              className={`crop-pill text-xs px-1.5 py-0.5 font-pixel ${statusColors[crop.status] ?? 'bg-ink-400/20 text-ink-700'} hover:opacity-80 transition-opacity`}
            >
              {crop.name}
            </button>
          ))}
          {canEdit && (
            <button
              onClick={() => onAddCrop(plotId)}
              className="btn-pixel btn-pixel-sm text-xs px-1.5 py-0.5"
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
}
