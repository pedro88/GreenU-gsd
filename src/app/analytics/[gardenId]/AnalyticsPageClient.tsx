'use client';

import Link from 'next/link';
import { useGetAnalyticsQuery } from '@/store/api/analyticsApi';
import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';

interface AnalyticsPageClientProps {
  gardenId: string;
  gardenName: string;
}

/**
 * Client component that fetches and displays garden analytics with charts and performance data.
 * @param root0 - Props object
 * @param root0.gardenId - The ID of the garden to show analytics for
 * @param root0.gardenName - The display name of the garden
 * @returns The analytics dashboard JSX
 */
export function AnalyticsPageClient({ gardenId, gardenName }: AnalyticsPageClientProps) {
  const { data, isLoading, isError } = useGetAnalyticsQuery(gardenId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <Link
                href={`/garden/${gardenId}`}
                className="text-gray-400 hover:text-gray-600 transition-colors text-sm"
              >
                ← Back to garden
              </Link>
              <div className="h-5 w-px bg-gray-200" />
              <h1 className="font-semibold text-gray-900">📊 {gardenName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/garden/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🗺️ Garden
              </Link>
              <Link
                href={`/calendar/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📅 Calendar
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent" />
          </div>
        ) : isError || !data ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-2xl mb-2">⚠️</div>
            <p>Failed to load analytics</p>
          </div>
        ) : (
          <AnalyticsDashboard data={data} />
        )}
      </div>
    </div>
  );
}
