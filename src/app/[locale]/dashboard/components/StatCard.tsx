import React from 'react';

interface StatCardProps {
  title: string;
  value: number | string;
  trend?: number;
  icon: React.ReactNode;
  loading?: boolean;
  variant?: 'default' | 'highlight';
}

export default function StatCard({
  title,
  value,
  trend,
  icon,
  loading = false,
  variant = 'default',
}: StatCardProps) {
  const trendColor =
    trend !== undefined ? (trend >= 0 ? 'text-forest-500' : 'text-terracotta-500') : 'text-ink-600';

  const trendBg =
    trend !== undefined ? (trend >= 0 ? 'bg-forest-200' : 'bg-terracotta-100') : 'bg-cream-200';

  return (
    <div
      className={`stat-card relative ${variant === 'highlight' ? 'ring-[3px] ring-terracotta-400' : ''}`}
      style={{
        background: variant === 'highlight' ? '#ffcc4d' : 'var(--theme-bg-primary, #fff8e7)',
        borderColor: variant === 'highlight' ? '#302818' : 'var(--theme-border-color, #5c4b26)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p
            className="font-pixel text-xs font-semibold uppercase tracking-widest mb-1"
            style={{
              color: variant === 'highlight' ? '#302818' : 'var(--theme-text-secondary, #7a6330)',
            }}
          >
            {title}
          </p>
          {loading ? (
            <div
              className="h-8 w-16 animate-pulse"
              style={{ background: variant === 'highlight' ? '#302818/20' : '#e8dfd0' }}
            />
          ) : (
            <p
              className="text-3xl font-bold font-pixel mt-2"
              style={{
                color: variant === 'highlight' ? '#302818' : 'var(--theme-text-primary, #302818)',
                textShadow: variant === 'highlight' ? 'none' : '2px 2px 0px #d4c5a9',
              }}
            >
              {value}
            </p>
          )}
          {trend !== undefined && !loading && (
            <div
              className={`inline-flex items-center gap-1 mt-2 px-2 py-1 text-xs font-pixel ${trendColor}`}
              style={{ background: trendBg }}
            >
              <span>{trend >= 0 ? '▲' : '▼'}</span>
              <span>{Math.abs(trend)}%</span>
              <span style={{ color: 'var(--theme-text-secondary, #7a6330)' }}>ce mois</span>
            </div>
          )}
        </div>
        <div
          className="p-3 flex items-center justify-center"
          style={{
            background: variant === 'highlight' ? '#302818' : 'var(--theme-bg-tertiary, #ffcc4d)',
            border: `3px solid ${variant === 'highlight' ? '#ffcc4d' : '#302818'}`,
            boxShadow: '3px 3px 0px 0px #302818',
          }}
        >
          <div style={{ color: variant === 'highlight' ? '#ffcc4d' : '#302818' }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}
