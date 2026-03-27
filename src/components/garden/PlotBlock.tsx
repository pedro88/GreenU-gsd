import { CropSummary } from '@/store/api/gardenVisualizationApi';

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
    PLANTED: 'bg-gray-200 text-gray-700',
    SEEDLING: 'bg-yellow-100 text-yellow-800',
    VEGETATIVE: 'bg-green-200 text-green-800',
    FLOWERING: 'bg-purple-100 text-purple-800',
    FRUITING: 'bg-orange-100 text-orange-800',
    HARVESTING: 'bg-emerald-200 text-emerald-800',
    HARVESTED: 'bg-gray-100 text-gray-500',
    FAILED: 'bg-red-100 text-red-700',
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-2 min-h-[60px] flex flex-col gap-1">
      <span className="text-xs font-semibold text-gray-700 truncate">{name}</span>
      {crops.length === 0 ? (
        canEdit ? (
          <button
            onClick={() => onAddCrop(plotId)}
            className="flex-1 flex items-center justify-center text-xs text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors min-h-[32px]"
          >
            + Add crop
          </button>
        ) : (
          <div className="flex-1 flex items-center justify-center text-xs text-gray-300 min-h-[32px]">
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
              className={`text-xs px-1.5 py-0.5 rounded font-medium ${statusColors[crop.status] ?? 'bg-gray-100 text-gray-700'} hover:opacity-80 transition-opacity`}
            >
              {crop.name}
            </button>
          ))}
          {canEdit && (
            <button
              onClick={() => onAddCrop(plotId)}
              className="text-xs px-1.5 py-0.5 rounded bg-gray-50 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
            >
              +
            </button>
          )}
        </div>
      )}
    </div>
  );
}
