'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface Garden {
  id: string;
  name: string;
  userRole: string;
  stats: {
    zoneCount: number;
    plotCount: number;
    activeCropCount: number;
    gardenerCount: number;
    followerCount: number;
    todoCount: number;
  };
}

interface GardenSelectorProps {
  gardens: Garden[];
  currentGardenId: string | null;
  onGardenChange: (gardenId: string) => void;
  onSetAsMain: (gardenId: string) => void;
  onCreateGarden: () => void;
  isLoading?: boolean;
}

/**
 * GardenSelector - Dropdown for selecting the active garden
 * Shows all gardens the user has access to with stats preview
 */
export function GardenSelector({
  gardens,
  currentGardenId,
  onGardenChange,
  onSetAsMain,
  onCreateGarden,
  isLoading,
}: GardenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentGarden = gardens.find((g) => g.id === currentGardenId);
  
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-ink-100 border-[3px] border-ink-700 rounded-none" />
      </div>
    );
  }
  
  if (gardens.length === 0) {
    return (
      <Button variant="primary" onClick={onCreateGarden}>
        ➕ CREATE YOUR FIRST GARDEN
      </Button>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <Select value={currentGardenId || ''} onValueChange={onGardenChange}>
        <SelectTrigger className="w-[300px] h-12">
          <SelectValue placeholder="Select a garden">
            {currentGarden && (
              <div className="flex items-center gap-2">
                <span className="font-pixel text-sm font-bold">
                  🌱 {currentGarden.name}
                </span>
                <span className="font-pixel text-xs text-ink-500 uppercase">
                  {currentGarden.userRole === 'owner' ? 'OWNER' : currentGarden.userRole}
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {gardens.map((garden) => (
            <div
              key={garden.id}
              className="relative px-2 py-3 hover:bg-cream-100 cursor-pointer"
              onClick={() => onGardenChange(garden.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-pixel text-sm font-bold text-ink-900">
                    🌱 {garden.name}
                  </div>
                  <div className="font-body text-xs text-ink-500 mt-0.5">
                    {garden.stats.zoneCount} zones · {garden.stats.activeCropCount} plants
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-pixel text-[10px] text-ink-400 uppercase">
                    {garden.userRole}
                  </span>
                  {garden.userRole !== 'viewer' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsMain(garden.id);
                      }}
                      className="font-pixel text-[10px] text-terracotta-500 hover:text-terracotta-700"
                      title="Set as main garden"
                    >
                      ★
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div className="border-t-[2px] border-ink-200 mt-1 pt-1 px-2 pb-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateGarden();
              }}
              className="w-full flex items-center gap-2 px-2 py-2 font-pixel text-xs text-forest-600 hover:bg-forest-50 transition-colors"
            >
              ➕ CREATE NEW GARDEN
            </button>
          </div>
        </SelectContent>
      </Select>
      
      {currentGarden && currentGarden.userRole !== 'viewer' && (
        <Button variant="ghost" size="sm" onClick={() => onGardenChange(currentGardenId || '')}>
          ↻
        </Button>
      )}
    </div>
  );
}
