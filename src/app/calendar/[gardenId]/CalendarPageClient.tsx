'use client';

import Link from 'next/link';
import { useGetCalendarQuery } from '@/store/api/calendarApi';
import { CalendarView } from '@/components/calendar/CalendarView';
import { TaskList } from '@/components/calendar/TaskList';

interface CalendarPageClientProps {
  gardenId: string;
  gardenName: string;
}

/**
 * Calendar page client component
 * Shows monthly calendar and task list based on user's location
 */
export function CalendarPageClient({ gardenId, gardenName }: CalendarPageClientProps) {
  const { data, isLoading, isError } = useGetCalendarQuery(gardenId);

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
              <h1 className="font-semibold text-gray-900">📅 {gardenName}</h1>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/garden/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                🗺️ Garden
              </Link>
              <Link
                href={`/analytics/${gardenId}`}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                📊 Analytics
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
            <p>Failed to load calendar</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar view — takes 2/3 width on large screens */}
            <div className="lg:col-span-2">
              <CalendarView
                tasks={data.tasks}
                lastSpringFrost={data.lastSpringFrost}
                firstFallFrost={data.firstFallFrost}
                climateZone={data.climateZone}
              />
            </div>

            {/* Task list — sidebar on large screens */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Tasks</h3>
                <TaskList tasks={data.tasks} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
