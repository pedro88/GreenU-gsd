'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface MonthlyActivityChartProps {
  data: { month: string; label: string; harvests: number }[];
}

/**
 * Line chart showing monthly harvest activity over the past year.
 * @param root0 - Props object
 * @param root0.data - Array of monthly data with month, label, and harvest count
 * @returns The line chart JSX
 */
export function MonthlyActivityChart({ data }: MonthlyActivityChartProps) {
  if (data.every((d) => d.harvests === 0)) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No harvest activity recorded yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#6b7280' }} interval={1} />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          formatter={(value) => [`${value} harvests`, 'Activity']}
        />
        <Line
          type="monotone"
          dataKey="harvests"
          stroke="#16a34a"
          strokeWidth={2}
          dot={{ fill: '#16a34a', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
