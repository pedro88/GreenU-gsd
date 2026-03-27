import { PlotBlock } from './PlotBlock';
import { ZoneLayout } from '@/store/api/gardenVisualizationApi';

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
    <div className={`rounded-xl border-2 p-3 flex flex-col gap-2 ${style}`} data-zone-id={zone.id}>
      {/* Zone header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-sm" aria-hidden>
            {typeIcons[zone.type] ?? '🌱'}
          </span>
          <h3 className="font-semibold text-gray-800 text-sm">{zone.name}</h3>
        </div>
        {canEdit && (
          <button
            onClick={() => onDeleteZone(zone.id)}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors px-1"
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
              className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-white transition-all"
            >
              + Add plot
            </button>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-400 py-3">
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
              className="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-white transition-all text-xs py-2"
            >
              + Plot
            </button>
          )}
        </div>
      )}
    </div>
  );
}
