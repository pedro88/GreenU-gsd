'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';

interface QuickActionsProps {
  gardenId: string | null;
  userRole: string;
  onAddZone: () => void;
  onAddCrop: () => void;
  onCreateGarden: () => void;
  isLoading?: boolean;
}

/**
 * QuickActions - Grid of quick action buttons for garden management
 */
export function QuickActions({
  gardenId,
  userRole,
  onAddZone,
  onAddCrop,
  onCreateGarden,
  isLoading,
}: QuickActionsProps) {
  const canEdit = userRole === 'owner' || userRole === 'editor';
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-20 bg-ink-100 border-[3px] border-ink-300" />
          </div>
        ))}
      </div>
    );
  }
  
  const actions = [
    {
      label: 'Add Zone',
      icon: '➕',
      action: onAddZone,
      disabled: !gardenId || !canEdit,
      href: null,
    },
    {
      label: 'Add Crop',
      icon: '🌱',
      action: onAddCrop,
      disabled: !gardenId || !canEdit,
      href: null,
    },
    {
      label: 'Calendar',
      icon: '📅',
      action: null,
      disabled: !gardenId,
      href: `/calendar/${gardenId}`,
    },
    {
      label: 'Photos',
      icon: '📷',
      action: null,
      disabled: !gardenId,
      href: `/garden/${gardenId}/photos`,
    },
    {
      label: 'Todos',
      icon: '✅',
      action: null,
      disabled: !gardenId,
      href: `/garden/${gardenId}/todos`,
    },
    {
      label: 'Invite',
      icon: '👤+',
      action: null,
      disabled: !gardenId || userRole !== 'owner',
      href: `/garden/${gardenId}/settings`,
    },
  ];
  
  return (
    <div className="space-y-3">
      <h3 className="font-pixel text-sm font-bold text-ink-800 uppercase tracking-wider">
        ✦ QUICK ACTIONS ✦
      </h3>
      
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {actions.map((action) => {
          const content = (
            <Card
              className={`p-3 text-center cursor-pointer transition-all duration-75 ${
                action.disabled
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#302818] active:translate-y-1 active:shadow-none'
              }`}
            >
              <div className="text-2xl mb-1">{action.icon}</div>
              <div className="font-pixel text-[10px] font-semibold text-ink-700 uppercase tracking-wide">
                {action.label}
              </div>
            </Card>
          );
          
          if (action.href) {
            return (
              <Link key={action.label} href={action.href}>
                {content}
              </Link>
            );
          }
          
          return (
            <button
              key={action.label}
              onClick={action.action && !action.disabled ? action.action : undefined}
              disabled={action.disabled}
              type="button"
            >
              {content}
            </button>
          );
        })}
        
        {/* Create new garden - always available */}
        <button 
          onClick={() => onCreateGarden()} 
          className="md:col-span-6 lg:col-span-1"
          type="button"
        >
          <Card className="p-3 text-center border-dashed border-forest-400 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#2D8A2D] active:translate-y-1 active:shadow-none transition-all duration-75">
            <div className="text-2xl mb-1">🆕</div>
            <div className="font-pixel text-[10px] font-semibold text-forest-600 uppercase tracking-wide">
              New Garden
            </div>
          </Card>
        </button>
      </div>
    </div>
  );
}
