import React from 'react';

interface ActivityItemProps {
  type: string;
  date: string;
  gardenName: string;
  cropName: string;
  notes?: string;
}

const activityConfig: Record<
  string,
  { icon: string; bgColor: string; borderColor: string; textColor: string; label: string }
> = {
  SOWING: {
    icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    bgColor: '#4ca64c',
    borderColor: '#2d6a2d',
    textColor: '#fff8e7',
    label: 'Semis',
  },
  TRANSPLANTING: {
    icon: 'M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4',
    bgColor: '#5b8fd9',
    borderColor: '#3d6090',
    textColor: '#fff8e7',
    label: 'Repiquage',
  },
  WATERING: {
    icon: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
    bgColor: '#5bc0de',
    borderColor: '#3a8fa8',
    textColor: '#302818',
    label: 'Arrosage',
  },
  FERTILIZING: {
    icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z',
    bgColor: '#ffcc4d',
    borderColor: '#cc9933',
    textColor: '#302818',
    label: 'Fertilisation',
  },
  PRUNING: {
    icon: 'M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z',
    bgColor: '#ff6f4d',
    borderColor: '#cc4422',
    textColor: '#fff8e7',
    label: 'Taille',
  },
  PEST_CONTROL: {
    icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    bgColor: '#e74c3c',
    borderColor: '#b33a2e',
    textColor: '#fff8e7',
    label: 'Lutte antiparasite',
  },
  HARVEST: {
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    bgColor: '#ffcc4d',
    borderColor: '#cc9933',
    textColor: '#302818',
    label: 'Récolte',
  },
  NOTE: {
    icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
    bgColor: '#b09158',
    borderColor: '#7a6330',
    textColor: '#fff8e7',
    label: 'Note',
  },
  OTHER: {
    icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    bgColor: '#9a7b3c',
    borderColor: '#6b5a3a',
    textColor: '#fff8e7',
    label: 'Autre',
  },
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "À l'instant";
  if (diffMins < 60) return `Il y a ${diffMins} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR');
}

export default function ActivityItem({
  type,
  date,
  gardenName,
  cropName,
  notes,
}: ActivityItemProps) {
  const config = activityConfig[type] || activityConfig.OTHER;

  return (
    <div
      className="flex items-start p-3 transition-all hover:translate-x-1"
      style={{
        background: '#fff8e7',
        borderBottom: '2px solid #e8dfd0',
      }}
    >
      <div
        className="flex-shrink-0 p-2 flex items-center justify-center"
        style={{
          background: config.bgColor,
          border: `2px solid ${config.borderColor}`,
          boxShadow: '2px 2px 0px 0px #302818',
          color: config.textColor,
        }}
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d={config.icon} />
        </svg>
      </div>
      <div className="ml-3 flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-pixel">
            <span style={{ color: config.bgColor, fontWeight: 'bold' }}>{config.label}</span>
            <span style={{ color: '#7a6330' }}> — </span>
            <span style={{ color: '#302818' }}>{cropName}</span>
          </p>
          <p className="text-xs font-pixel" style={{ color: '#9a7b3c' }}>
            {formatRelativeDate(date)}
          </p>
        </div>
        <p className="text-sm mt-1" style={{ color: '#7a6330' }}>
          <span className="font-pixel" style={{ color: '#5c8a4a' }}>
            {gardenName}
          </span>
        </p>
        {notes && (
          <p className="text-sm mt-1 truncate font-body" style={{ color: '#9a7b3c' }}>
            {notes}
          </p>
        )}
      </div>
    </div>
  );
}
