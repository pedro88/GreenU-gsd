'use client';

import { useState } from 'react';
import { CalendarTask } from '@/store/api/calendarApi';

interface TaskListProps {
  tasks: CalendarTask[];
}

/**
 * Scrollable task list filtered by time period (all, today, week, month).
 * Groups tasks by date and displays them with type-based color coding.
 * @param root0 - Props object
 * @param root0.tasks - Array of calendar tasks to display
 * @returns The filtered, grouped task list JSX
 */
export function TaskList({ tasks }: TaskListProps) {
  const [filter, setFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const today = new Date().toISOString().split('T')[0];
  const weekFromNow = new Date();
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  const monthFromNow = new Date();
  monthFromNow.setDate(monthFromNow.getDate() + 30);
  const weekStr = weekFromNow.toISOString().split('T')[0];
  const monthStr = monthFromNow.toISOString().split('T')[0];

  const filtered = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'today') return task.date === today;
    if (filter === 'week') return task.date >= today && task.date <= weekStr;
    if (filter === 'month') return task.date >= today && task.date <= monthStr;
    return true;
  });

  // Group by date
  const grouped: Record<string, CalendarTask[]> = {};
  for (const task of filtered) {
    if (!grouped[task.date]) grouped[task.date] = [];
    grouped[task.date].push(task);
  }

  const sortedDates = Object.keys(grouped).sort();

  const taskColors: Record<string, string> = {
    sow_indoors: 'pixel-badge',
    sow_outdoors: 'pixel-badge-green',
    transplant: 'pixel-badge',
    harvest: 'pixel-badge-cream',
    fertilize: 'pixel-badge',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const todayStr = new Date().toISOString().split('T')[0];
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

    if (dateStr === todayStr) return 'Today';
    if (dateStr === tomorrowStr) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {/* Filter tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {(['all', 'today', 'week', 'month'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors capitalize
              ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {f === 'all'
              ? 'All'
              : f === 'today'
                ? 'Today'
                : f === 'week'
                  ? 'This week'
                  : 'This month'}
          </button>
        ))}
      </div>

      {/* Tasks grouped by date */}
      {sortedDates.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <div className="text-2xl mb-2">📋</div>
          <p className="text-sm">No tasks scheduled</p>
          <p className="text-xs mt-1">
            {filter === 'all'
              ? 'Add crops to your garden to see tasks'
              : `No tasks ${filter === 'today' ? 'today' : 'this ' + filter}`}
          </p>
        </div>
      ) : (
        sortedDates.map((dateStr) => (
          <div key={dateStr}>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1 px-1">
              {formatDate(dateStr)}
            </div>
            <div className="space-y-1.5">
              {grouped[dateStr].map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-2.5 rounded-lg border ${taskColors[task.type] ?? 'bg-gray-50 text-gray-700 border-gray-200'} ${task.status === 'overdue' ? 'opacity-70' : ''}`}
                >
                  <span className="text-base">{taskIcons[task.type] ?? '📋'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{task.label}</div>
                    <div className="text-xs opacity-75">
                      {task.zoneName} · {task.plotName}
                    </div>
                  </div>
                  {task.status === 'overdue' && (
                    <span className="text-xs font-semibold bg-red-100 text-red-600 px-1.5 py-0.5 rounded">
                      Overdue
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

const taskIcons: Record<string, string> = {
  sow_indoors: '🌱',
  sow_outdoors: '🌿',
  transplant: '🪴',
  harvest: '🍽️',
  fertilize: '💧',
};
