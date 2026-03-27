'use client';

import { AnalyticsResponse } from '@/store/api/analyticsApi';
import { HarvestChart } from './HarvestChart';
import { MonthlyActivityChart } from './MonthlyActivityChart';
import { CropFamilyChart } from './CropFamilyChart';

interface AnalyticsDashboardProps {
  data: AnalyticsResponse;
}

/**
 * Main analytics dashboard component that displays garden statistics and charts.
 * Shows summary cards with key metrics, yield/crop charts, and a zone breakdown table.
 * @param props - Component props containing analytics data
 * @param props.data - Full analytics response including summary, crops, and zone data
 * @returns The rendered analytics dashboard with charts and summary statistics
 */
export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { summary, topCrops, cropsByFamily, monthlyActivity, zones } = data;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total planted" value={summary.totalPlanted} icon="🌱" color="stat-card" />
        <StatCard label="Harvested" value={summary.totalHarvested} icon="🍽️" color="stat-card" />
        <StatCard label="Active crops" value={summary.activeCrops} icon="🪴" color="stat-card" />
        <StatCard
          label="Success rate"
          value={`${summary.successRate}%`}
          icon="📈"
          color="stat-card"
          subtitle={summary.totalFailed > 0 ? `${summary.totalFailed} failed` : undefined}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield by crop */}
        <div className="chart-container">
          <h3 className="pixel-heading">Yield by crop</h3>
          <HarvestChart data={topCrops} />
        </div>

        {/* Crops by family */}
        <div className="chart-container">
          <h3 className="pixel-heading">Crops by family</h3>
          <CropFamilyChart data={cropsByFamily} />
        </div>

        {/* Monthly activity — full width */}
        <div className="chart-container lg:col-span-2">
          <h3 className="pixel-heading">Monthly harvest activity</h3>
          <MonthlyActivityChart data={monthlyActivity} />
        </div>
      </div>

      {/* Zone breakdown */}
      {zones.length > 0 && (
        <div className="pixel-card">
          <h3 className="pixel-heading">By zone</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 px-3 text-gray-500 font-medium">Zone</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Crops</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Harvests</th>
                  <th className="text-right py-2 px-3 text-gray-500 font-medium">Rate</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((zone) => (
                  <tr key={zone.zone} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 px-3 font-medium text-gray-800">{zone.zone}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{zone.crops}</td>
                    <td className="py-2 px-3 text-right text-gray-600">{zone.harvests}</td>
                    <td className="py-2 px-3 text-right">
                      <span
                        className={`font-medium ${zone.crops > 0 && zone.harvests / zone.crops >= 0.5 ? 'text-green-600' : 'text-gray-600'}`}
                      >
                        {zone.crops > 0 ? Math.round((zone.harvests / zone.crops) * 100) : 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

/**
 * Renders a single stat card displaying a metric with an icon and color-coded background.
 * Used within the analytics dashboard summary section.
 * @param props - Stat card display properties
 * @param props.label - Short uppercase label for the stat metric
 * @param props.value - The numeric or string metric value to display prominently
 * @param props.icon - Emoji icon displayed alongside the label
 * @param props._color - Tailwind CSS classes for the card background and text color (reserved for future use)
 * @param props.subtitle - Optional secondary text shown below the value
 * @returns The rendered stat card element
 */
function StatCard({ label, value, icon, _color, subtitle }: StatCardProps) {
  return (
    <div className={`stat-card`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden>
          {icon}
        </span>
        <span className="pixel-label">{label}</span>
      </div>
      <div className="pixel-heading-lg">{value}</div>
      {subtitle && <div className="text-xs mt-0.5 opacity-70">{subtitle}</div>}
    </div>
  );
}
