'use client';

import React, { useState, useEffect } from 'react';
import ActivityItem from './ActivityItem';

interface Activity {
  id: string;
  type: string;
  date: string;
  gardenName: string;
  cropName: string;
  notes?: string;
}

interface ActivityListProps {
  userId: string;
  limit?: number;
}

export default function ActivityList({ userId, limit = 10 }: ActivityListProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch(`/api/dashboard/activities?userId=${userId}&limit=${limit}`);
        if (!response.ok) throw new Error('Erreur lors du chargement');
        const data = await response.json();
        setActivities(data);
      } catch (err) {
        setError('Impossible de charger les activités');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [userId, limit]);

  if (loading) {
    return (
      <div className="pixel-card">
        <div className="px-4 py-3 border-b-[3px] border-ink-700">
          <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
            Dernières activités
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start animate-pulse">
              <div className="h-10 w-10" style={{ background: '#e8dfd0' }}></div>
              <div className="ml-3 flex-1">
                <div className="h-4 w-3/4" style={{ background: '#e8dfd0' }}></div>
                <div className="h-3 w-1/2 mt-2" style={{ background: '#e8dfd0' }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pixel-card">
        <div className="px-4 py-3 border-b-[3px] border-ink-700">
          <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
            Dernières activités
          </h3>
        </div>
        <div className="p-4">
          <p className="font-pixel text-sm" style={{ color: '#ff5526' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pixel-card">
      <div className="px-4 py-3 border-b-[3px] border-ink-700" style={{ background: '#e8dfd0' }}>
        <h3 className="font-pixel text-sm font-bold uppercase tracking-widest text-ink-900">
          Dernières activités
        </h3>
      </div>
      <div>
        {activities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="font-pixel text-sm" style={{ color: '#7a6330' }}>
              Aucune activité récente
            </p>
            <p className="text-xs mt-1" style={{ color: '#9a7b3c' }}>
              Commencez par ajouter des cultures à vos jardins
            </p>
          </div>
        ) : (
          activities.map((activity) => (
            <ActivityItem
              key={activity.id}
              type={activity.type}
              date={activity.date}
              gardenName={activity.gardenName}
              cropName={activity.cropName}
              notes={activity.notes}
            />
          ))
        )}
      </div>
      {activities.length > 0 && (
        <div className="px-4 py-3 border-t-[3px] border-ink-700" style={{ background: '#e8dfd0' }}>
          <button type="button" className="btn-pixel btn-pixel-sm text-xs">
            Voir toutes les activités
          </button>
        </div>
      )}
    </div>
  );
}
