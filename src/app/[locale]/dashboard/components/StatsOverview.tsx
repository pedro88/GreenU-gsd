'use client';

import React from 'react';
import StatCard from './StatCard';

interface StatsData {
  gardenCount: number;
  cropCount: number;
  harvestCount: number;
  totalXP: number;
  trend: {
    gardenCountChange: number;
    cropCountChange: number;
    harvestCountChange: number;
    totalXPChange: number;
  };
}

interface StatsOverviewProps {
  stats: StatsData | null;
  loading: boolean;
  onCardClick?: (card: 'gardens' | 'crops' | 'harvests') => void;
  expandedCard?: 'gardens' | 'crops' | 'harvests' | null;
}

export default function StatsOverview({
  stats,
  loading,
  onCardClick,
  expandedCard,
}: StatsOverviewProps) {
  const icons = {
    gardens: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
    crops: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
    ),
    harvest: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
    xp: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => onCardClick?.('gardens')}
          className={`text-left w-full transition-all ${expandedCard === 'gardens' ? 'ring-4 ring-terracotta-400' : 'hover:-translate-y-1'}`}
        >
          <StatCard
            title="Jardins"
            value={stats?.gardenCount ?? 0}
            trend={stats?.trend.gardenCountChange}
            icon={icons.gardens}
            loading={loading}
            variant={expandedCard === 'gardens' ? 'highlight' : 'default'}
          />
        </button>

        <button
          type="button"
          onClick={() => onCardClick?.('crops')}
          className={`text-left w-full transition-all ${expandedCard === 'crops' ? 'ring-4 ring-forest-400' : 'hover:-translate-y-1'}`}
        >
          <StatCard
            title="Cultures actives"
            value={stats?.cropCount ?? 0}
            trend={stats?.trend.cropCountChange}
            icon={icons.crops}
            loading={loading}
          />
        </button>

        <button
          type="button"
          onClick={() => onCardClick?.('harvests')}
          className={`text-left w-full transition-all ${expandedCard === 'harvests' ? 'ring-4 ring-terracotta-400' : 'hover:-translate-y-1'}`}
        >
          <StatCard
            title="Récoltes"
            value={stats?.harvestCount ?? 0}
            trend={stats?.trend.harvestCountChange}
            icon={icons.harvest}
            loading={loading}
          />
        </button>

        <button type="button" className="text-left w-full transition-all hover:-translate-y-1">
          <StatCard
            title="XP Total"
            value={stats?.totalXP ?? 0}
            trend={stats?.trend.totalXPChange}
            icon={icons.xp}
            loading={loading}
            variant="highlight"
          />
        </button>
      </div>

      {/* Instruction hint */}
      <p className="font-pixel text-xs text-center" style={{ color: '#9a7b3c' }}>
        💡 Cliquez sur une carte pour voir les détails
      </p>
    </div>
  );
}
