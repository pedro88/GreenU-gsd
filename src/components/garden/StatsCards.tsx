'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface GardenStats {
  zoneCount: number;
  plotCount: number;
  activeCropCount: number;
  gardenerCount: number;
  followerCount: number;
  todoCount: number;
}

interface StatsCardsProps {
  stats: GardenStats | null;
  isLoading?: boolean;
}

/**
 * StatsCards - Displays key garden statistics
 * Shows: growing boards, todos, followers, gardeners
 */
export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="animate-pulse">
            <Card className="p-4">
              <div className="h-16 bg-ink-100" />
            </Card>
          </div>
        ))}
      </div>
    );
  }
  
  if (!stats) {
    return null;
  }
  
  const cards = [
    {
      label: 'GROWING BOARDS',
      value: stats.plotCount,
      icon: '🌱',
      color: 'text-forest-600',
    },
    {
      label: 'TODOS',
      value: stats.todoCount,
      icon: '✅',
      color: 'text-terracotta-600',
      highlight: stats.todoCount > 0,
    },
    {
      label: 'FOLLOWERS',
      value: stats.followerCount,
      icon: '👥',
      color: 'text-ink-600',
    },
    {
      label: 'GARDENERS',
      value: stats.gardenerCount,
      icon: '👨‍🌾',
      color: 'text-ink-600',
    },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          className={`p-4 ${card.highlight ? 'border-terracotta-500' : ''}`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">{card.icon}</span>
            {card.highlight && (
              <Badge variant="warning" size="sm">ACTIVE</Badge>
            )}
          </div>
          <div className={`font-pixel text-2xl font-bold ${card.color}`}>
            {card.value}
          </div>
          <div className="font-pixel text-[10px] text-ink-500 uppercase tracking-widest mt-1">
            {card.label}
          </div>
        </Card>
      ))}
    </div>
  );
}
