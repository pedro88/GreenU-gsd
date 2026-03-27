'use client';

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface CropFamilyChartProps {
  data: { name: string; count: number }[];
}

/**
 * Pie chart showing the distribution of planted crops by plant family.
 * @param root0 - Props object
 * @param root0.data - Array of crop family names with their count
 * @returns The pie chart JSX
 */
export function CropFamilyChart({ data }: CropFamilyChartProps) {
  const COLORS = [
    '#16a34a', // green
    '#2563eb', // blue
    '#9333ea', // purple
    '#ea580c', // orange
    '#db2777', // pink
    '#0891b2', // cyan
    '#ca8a04', // yellow
    '#64748b', // slate
  ];

  if (data.length === 0) {
    return (
      <div
        className="flex items-center justify-center h-48 text-sm font-pixel"
        style={{ color: '#302818' }}
      >
        No crops planted yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={40}
          outerRadius={75}
          paddingAngle={2}
          dataKey="count"
          nameKey="name"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 4,
            border: '2px solid #302818',
            backgroundColor: '#FFF8E7',
            fontFamily: 'monospace',
          }}
          formatter={(value, name) => [`${value} crops`, name as string]}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: 'monospace' }}
          formatter={(value: string) => <span style={{ color: '#302818' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
