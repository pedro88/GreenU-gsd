'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/lib/hooks';
import {
  fetchDashboardData,
  selectStats,
  selectGardens,
  selectExpandedCard,
  setExpandedCard,
} from '@/store/slices/dashboardSlice';
import DashboardLayout from './components/DashboardLayout';
import StatsOverview from './components/StatsOverview';
import ActivityList from './components/ActivityList';
import TodoList from './components/TodoList';
import { useSession } from 'next-auth/react';
import GardenCardsList from './components/GardenCardsList';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const stats = useAppSelector(selectStats);
  const gardens = useAppSelector(selectGardens);
  const expandedCard = useAppSelector(selectExpandedCard);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user) {
      dispatch(fetchDashboardData());
    }
  }, [session, dispatch]);

  const handleCardClick = (card: 'gardens' | 'crops' | 'harvests') => {
    dispatch(setExpandedCard(card));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2
              className="text-2xl font-bold font-pixel text-ink-900"
              style={{ textShadow: '2px 2px 0px #d4c5a9' }}
            >
              Bienvenue{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}
            </h2>
            <p className="font-body text-sm mt-1" style={{ color: '#7a6330' }}>
              Voici un aperçu de l&apos;activité de vos jardins
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button type="button" className="btn-pixel btn-pixel-primary">
              <svg
                className="-ml-1 mr-2 h-4 w-4 inline-block"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Nouveau jardin
            </button>
          </div>
        </div>

        {/* Stats Section */}
        <section aria-label="Statistiques du dashboard">
          <StatsOverview
            stats={stats}
            loading={!stats}
            onCardClick={handleCardClick}
            expandedCard={expandedCard}
          />
        </section>

        {/* Expanded Card Content */}
        {expandedCard === 'gardens' && (
          <section aria-label="Détails des jardins" className="animate-fadeIn">
            <GardenCardsList gardens={gardens} />
          </section>
        )}

        {/* Activities & Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <section aria-label="Dernières activités">
            <ActivityList userId={session?.user?.id || 'demo-user'} limit={5} />
          </section>

          <section aria-label="Tâches en cours">
            <TodoList userId={session?.user?.id || 'demo-user'} groupBy="garden" />
          </section>
        </div>

        {/* Footer Info */}
        <div
          className="text-center text-sm font-pixel pt-4"
          style={{
            borderTop: '3px solid #e8dfd0',
            color: '#9a7b3c',
          }}
        >
          <p>
            Dashboard mis à jour automatiquement.{' '}
            <a href="/gardens" className="font-pixel underline" style={{ color: '#ff5526' }}>
              Gérer mes jardins →
            </a>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
