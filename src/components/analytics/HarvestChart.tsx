'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface HarvestChartProps {
  data: { name: string; totalYield: number; count: number }[];
}

/**
 * Horizontal bar chart showing top crops ranked by total harvest yield.
 * @param root0 - Props object
 * @param root0.data - Array of crops with name, total yield, and count
 * @returns The bar chart JSX
 */
export function HarvestChart({ data }: HarvestChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No harvest data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 60, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#6b7280' }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#374151' }} width={60} />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }} />
        <Bar dataKey="totalYield" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
