'use client';

import { useState, useMemo } from 'react';
import { CalendarTask } from '@/store/api/calendarApi';

interface CalendarViewProps {
  tasks: CalendarTask[];
  lastSpringFrost: string;
  firstFallFrost: string;
  climateZone: string;
}

/**
 * Monthly calendar view that displays garden tasks organized by date.
 * Includes frost date markers and navigation controls.
 * @param root0 - Props object
 * @param root0.tasks - Array of calendar tasks to display
 * @param root0.lastSpringFrost - Date string of the last spring frost (MM-DD)
 * @param root0.firstFallFrost - Date string of the first fall frost (MM-DD)
 * @param root0.climateZone - The climate zone identifier and label
 * @returns The rendered calendar view JSX
 */
export function CalendarView({
  tasks,
  lastSpringFrost,
  firstFallFrost,
  climateZone,
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDay = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = lastDay.getDate();

  // Month name
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Group tasks by date string
  const tasksByDate = useMemo(() => {
    const map: Record<string, CalendarTask[]> = {};
    for (const task of tasks) {
      if (!map[task.date]) map[task.date] = [];
      map[task.date].push(task);
    }
    return map;
  }, [tasks]);

  // Special dates
  const _frostDates = {
    spring: lastSpringFrost,
    fall: firstFallFrost,
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const todayMonth = () => setCurrentDate(new Date());

  // Build calendar grid
  const days: (number | null)[] = [];
  for (let i = 0; i < startDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const taskIcons: Record<string, string> = {
    sow_indoors: '🌱',
    sow_outdoors: '🌿',
    transplant: '🪴',
    harvest: '🍽️',
    fertilize: '💧',
  };

  const today = new Date().toISOString().split('T')[0];
  const _currentMonthStr = `${year}-${String(month + 1).padStart(2, '0')}`;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[month]} {year}
          </h2>
          <p className="text-xs text-gray-500">{climateZone}</p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={prevMonth}
            className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            ←
          </button>
          <button
            onClick={todayMonth}
            className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            Today
          </button>
          <button
            onClick={nextMonth}
            className="px-2 py-1 text-sm text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          >
            →
          </button>
        </div>
      </div>

      {/* Frost date info */}
      <div className="flex gap-3 text-xs">
        <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded">
          <span>❄️</span>
          <span>Last frost: {lastSpringFrost}</span>
        </div>
        <div className="flex items-center gap-1 bg-orange-50 text-orange-700 px-2 py-1 rounded">
          <span>🍂</span>
          <span>First frost: {firstFallFrost}</span>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center py-2 text-xs font-medium text-gray-500">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="min-h-[72px] border-t border-gray-100" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasksByDate[dateStr] ?? [];
            const isToday = dateStr === today;
            const isFrostSpring = dateStr === lastSpringFrost;
            const isFrostFall = dateStr === firstFallFrost;

            return (
              <div
                key={dateStr}
                className={`min-h-[72px] border-t border-gray-100 p-1 ${isToday ? 'bg-green-50' : ''}`}
              >
                <div
                  className={`text-xs font-medium mb-0.5 ${isToday ? 'text-green-700' : 'text-gray-600'}`}
                >
                  {day}
                </div>

                {/* Frost markers */}
                {isFrostSpring && (
                  <div
                    className="text-[10px] text-blue-600 bg-blue-100 rounded px-1 mb-0.5"
                    title="Last spring frost"
                  >
                    ❄️ Frost
                  </div>
                )}
                {isFrostFall && (
                  <div
                    className="text-[10px] text-orange-600 bg-orange-100 rounded px-1 mb-0.5"
                    title="First fall frost"
                  >
                    🍂 Frost
                  </div>
                )}

                {/* Task dots */}
                <div className="flex flex-wrap gap-0.5">
                  {dayTasks.slice(0, 4).map((task) => (
                    <div
                      key={task.id}
                      title={task.label}
                      className={`text-xs w-5 h-5 rounded flex items-center justify-center
                        ${task.status === 'overdue' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}
                    >
                      {taskIcons[task.type] ?? '📋'}
                    </div>
                  ))}
                  {dayTasks.length > 4 && (
                    <div className="text-[10px] text-gray-400 self-center">
                      +{dayTasks.length - 4}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
