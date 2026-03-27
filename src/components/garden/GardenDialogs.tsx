'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface AddZoneDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (name: string, type: string) => Promise<void>;
}

/**
 * Dialog component for creating a new garden zone.
 * Displays a modal with form inputs for zone name and type selection.
 * @param props - Dialog visibility, close handler, and submit handler
 * @param props.open - Whether the dialog is visible
 * @param props.onClose - Callback when dialog should close
 * @param props.onSubmit - Callback with zone name and type when form is submitted
 * @returns The rendered dialog element or null if not open
 */
export function AddZoneDialog({ open, onClose, onSubmit }: AddZoneDialogProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState('OUTDOOR');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Zone name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(name.trim(), type);
      setName('');
      setType('OUTDOOR');
      onClose();
    } catch {
      setError('Failed to create zone');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="retro-dialog bg-cream-50 border-4 border-ink-900 p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-heading text-ink-900 mb-4">Add new zone</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pixel-label">Zone name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Raised bed 1, Greenhouse A"
              className="pixel-input"
              autoFocus
            />
          </div>
          <div>
            <label className="pixel-label">Zone type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="pixel-input w-full"
            >
              <option value="OUTDOOR">🌱 Outdoor</option>
              <option value="GREENHOUSE">🏠 Greenhouse</option>
              <option value="ORCHARD">🌳 Orchard</option>
              <option value="INDOOR">🪴 Indoor</option>
              <option value="TERRACE">🌿 Terrace</option>
            </select>
          </div>
          {error && <p className="text-sm text-terracotta-600 font-pixel">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="btn-pixel btn-pixel-ghost"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="btn-pixel btn-pixel-primary">
              Create zone
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddPlotDialogProps {
  open: boolean;
  zoneName: string;
  onClose: () => void;
  onSubmit: (name: string, sizeSqFt?: number, soilType?: string) => Promise<void>;
}

/**
 * Dialog component for creating a new plot within a specific zone.
 * Displays a modal with form inputs for plot name, size, and soil type.
 * @param props - Dialog visibility, zone context, and submit handler
 * @param props.open - Whether the dialog is visible
 * @param props.zoneName - Name of the parent zone for display purposes
 * @param props.onClose - Callback when dialog should close
 * @param props.onSubmit - Callback with plot details when form is submitted
 * @returns The rendered dialog element or null if not open
 */
export function AddPlotDialog({ open, zoneName, onClose, onSubmit }: AddPlotDialogProps) {
  const [name, setName] = useState('');
  const [sizeSqFt, setSizeSqFt] = useState('');
  const [soilType, setSoilType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Plot name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(
        name.trim(),
        sizeSqFt ? parseFloat(sizeSqFt) : undefined,
        soilType || undefined
      );
      setName('');
      setSizeSqFt('');
      setSoilType('');
      onClose();
    } catch {
      setError('Failed to create plot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="retro-dialog bg-cream-50 border-4 border-ink-900 p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-heading text-ink-900 mb-1">Add plot to {zoneName}</h2>
        <p className="text-sm text-ink-500 mb-4 font-pixel">Plot will appear inside this zone</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pixel-label">Plot name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Row 1, Bed A1"
              className="pixel-input"
              autoFocus
            />
          </div>
          <div>
            <label className="pixel-label">Size (sq ft, optional)</label>
            <Input
              type="number"
              value={sizeSqFt}
              onChange={(e) => setSizeSqFt(e.target.value)}
              placeholder="e.g., 16"
              min="0"
              step="0.5"
              className="pixel-input"
            />
          </div>
          <div>
            <label className="pixel-label">Soil type (optional)</label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="pixel-input w-full"
            >
              <option value="">Select soil type</option>
              <option value="clay">Clay</option>
              <option value="sandy">Sandy</option>
              <option value="loamy">Loamy</option>
              <option value="silty">Silty</option>
              <option value="peaty">Peaty</option>
              <option value="chalky">Chalky</option>
            </select>
          </div>
          {error && <p className="text-sm text-terracotta-600 font-pixel">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="btn-pixel btn-pixel-ghost"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="btn-pixel btn-pixel-primary">
              Create plot
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddCropDialogProps {
  open: boolean;
  plotName: string;
  gardenId: string;
  plants: Array<{ id: string; name: string; family: string }>;
  onClose: () => void;
  onSubmit: (plantTypeId: string, plantedDate: string, quantity?: number) => Promise<void>;
}

/**
 * Dialog component for planting a crop in a specific plot.
 * Displays a modal with plant type selection, planting date, and quantity inputs.
 * @param props - Dialog visibility, plot context, available plants, and submit handler
 * @param props.open - Whether the dialog is visible
 * @param props.plotName - Name of the parent plot for display purposes
 * @param props.gardenId - ID of the garden containing the plot
 * @param props.plants - List of available plant types to choose from
 * @param props.onClose - Callback when dialog should close
 * @param props.onSubmit - Callback with crop details when form is submitted
 * @returns The rendered dialog element or null if not open
 */
export function AddCropDialog({
  open,
  plotName,
  gardenId: _gardenId,
  plants,
  onClose,
  onSubmit,
}: AddCropDialogProps) {
  const [plantTypeId, setPlantTypeId] = useState('');
  const [plantedDate, setPlantedDate] = useState(new Date().toISOString().split('T')[0]);
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plantTypeId) {
      setError('Please select a plant');
      return;
    }
    if (!plantedDate) {
      setError('Planting date is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(plantTypeId, plantedDate, quantity ? parseFloat(quantity) : undefined);
      setPlantTypeId('');
      setPlantedDate(new Date().toISOString().split('T')[0]);
      setQuantity('');
      onClose();
    } catch {
      setError('Failed to plant crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="retro-dialog bg-cream-50 border-4 border-ink-900 p-6 max-w-sm w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="pixel-heading text-ink-900 mb-1">Plant in {plotName}</h2>
        <p className="text-sm text-ink-500 mb-4 font-pixel">Select a plant to grow in this plot</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="pixel-label">Plant type</label>
            <select
              value={plantTypeId}
              onChange={(e) => setPlantTypeId(e.target.value)}
              className="pixel-input w-full"
              autoFocus
            >
              <option value="">Select plant...</option>
              {plants.map((plant) => (
                <option key={plant.id} value={plant.id}>
                  {plant.name} ({plant.family})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="pixel-label">Planting date</label>
            <Input
              type="date"
              value={plantedDate}
              onChange={(e) => setPlantedDate(e.target.value)}
              className="pixel-input"
            />
          </div>
          <div>
            <label className="pixel-label">Quantity (optional)</label>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Number of plants"
              min="1"
              className="pixel-input"
            />
          </div>
          {error && <p className="text-sm text-terracotta-600 font-pixel">{error}</p>}
          <div className="flex gap-3 justify-end pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
              className="btn-pixel btn-pixel-ghost"
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading} className="btn-pixel btn-pixel-primary">
              Plant
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
