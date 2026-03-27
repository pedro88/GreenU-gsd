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
      <div
        className="flex items-center justify-center h-48 text-sm font-pixel"
        style={{ color: '#302818' }}
      >
        No harvest activity recorded yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ left: 16, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#302818" strokeOpacity={0.2} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#302818' }} interval={1} />
        <YAxis tick={{ fontSize: 11, fill: '#302818' }} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 4,
            border: '2px solid #302818',
            backgroundColor: '#FFF8E7',
            fontFamily: 'monospace',
          }}
          formatter={(value) => [`${value} harvests`, 'Activity']}
        />
        <Line
          type="monotone"
          dataKey="harvests"
          stroke="#FF5526"
          strokeWidth={2}
          dot={{ fill: '#FF5526', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
