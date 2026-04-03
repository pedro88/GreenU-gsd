'use client';

import React from 'react';
import Link from 'next/link';
import type { Garden } from '@/store/slices/dashboardSlice';

interface GardenCardsListProps {
  gardens: Garden[];
}

export default function GardenCardsList({ gardens }: GardenCardsListProps) {
  if (gardens.length === 0) {
    return (
      <div className="pixel-card p-6 text-center">
        <p className="font-pixel text-sm" style={{ color: '#7a6330' }}>
          Aucun jardin pour le moment
        </p>
        <button className="btn-pixel btn-pixel-secondary mt-4">Créer mon premier jardin</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-800">
          ✦ Mes Jardins ({gardens.length})
        </h3>
        <button
          className="btn-pixel btn-pixel-sm"
          style={{ background: '#4ca64c', color: '#fff8e7' }}
        >
          + Ajouter
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gardens.map((garden) => (
          <Link key={garden.id} href={`/garden/${garden.id}`} className="block">
            <div
              className="pixel-card p-4 transition-all hover:-translate-y-1 cursor-pointer"
              style={{ boxShadow: '4px 4px 0px 0px #302818' }}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-pixel text-sm font-bold text-ink-900 truncate">
                    {garden.name}
                  </h4>
                  {garden.location && (
                    <p className="text-xs font-body mt-1" style={{ color: '#9a7b3c' }}>
                      📍 {garden.location}
                    </p>
                  )}
                </div>
                <span
                  className="font-pixel text-xs px-2 py-1 border-[2px] border-ink-600"
                  style={{ background: '#e8dfd0', color: '#5c8a4a' }}
                >
                  {garden.stats.activeCropCount} cultures
                </span>
              </div>

              {/* Stats Grid */}
              <div
                className="grid grid-cols-3 gap-2 mt-3 pt-3"
                style={{ borderTop: '2px solid #e8dfd0' }}
              >
                <div className="text-center">
                  <div className="font-pixel text-lg font-bold text-terracotta-500">
                    {garden.stats.zoneCount}
                  </div>
                  <div className="font-pixel text-[10px] text-ink-500 uppercase tracking-wider">
                    Zones
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-pixel text-lg font-bold text-forest-500">
                    {garden.stats.plotCount}
                  </div>
                  <div className="font-pixel text-[10px] text-ink-500 uppercase tracking-wider">
                    Parcelles
                  </div>
                </div>
                <div className="text-center">
                  <div className="font-pixel text-lg font-bold text-terracotta-400">
                    {garden.stats.harvestCount}
                  </div>
                  <div className="font-pixel text-[10px] text-ink-500 uppercase tracking-wider">
                    Récoltes
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div
                className="flex items-center justify-between mt-3 pt-3"
                style={{ borderTop: '2px solid #e8dfd0' }}
              >
                <span className="font-pixel text-xs" style={{ color: '#9a7b3c' }}>
                  👥 {garden.stats.gardenerCount} collaborateurs
                </span>
                <span className="font-pixel text-xs" style={{ color: '#5c8a4a' }}>
                  →
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
