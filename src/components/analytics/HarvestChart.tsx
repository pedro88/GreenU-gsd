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
      <div
        className="flex items-center justify-center h-48 text-sm font-pixel"
        style={{ color: '#302818' }}
      >
        No harvest data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 60, right: 16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#302818" strokeOpacity={0.2} />
        <XAxis type="number" tick={{ fontSize: 11, fill: '#302818' }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#302818' }} width={60} />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 4,
            border: '2px solid #302818',
            backgroundColor: '#FFF8E7',
            fontFamily: 'monospace',
          }}
        />
        <Bar dataKey="totalYield" fill="#2D8A2D" radius={[0, 4, 4, 0]} barSize={20} />
      </BarChart>
    </ResponsiveContainer>
  );
}
