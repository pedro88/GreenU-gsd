'use client';

import { AnalyticsResponse } from '@/store/api/analyticsApi';
import { HarvestChart } from './HarvestChart';
import { MonthlyActivityChart } from './MonthlyActivityChart';
import { CropFamilyChart } from './CropFamilyChart';

interface AnalyticsDashboardProps {
  data: AnalyticsResponse;
}

/**
 * Main analytics dashboard component
 * Displays summary stats and charts
 */
export function AnalyticsDashboard({ data }: AnalyticsDashboardProps) {
  const { summary, topCrops, cropsByFamily, monthlyActivity, zones } = data;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total planted"
          value={summary.totalPlanted}
          icon="🌱"
          color="bg-green-50 text-green-700"
        />
        <StatCard
          label="Harvested"
          value={summary.totalHarvested}
          icon="🍽️"
          color="bg-amber-50 text-amber-700"
        />
        <StatCard
          label="Active crops"
          value={summary.activeCrops}
          icon="🪴"
          color="bg-blue-50 text-blue-700"
        />
        <StatCard
          label="Success rate"
          value={`${summary.successRate}%`}
          icon="📈"
          color={summary.successRate >= 70 ? 'bg-green-50 text-green-700' : summary.successRate >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'}
          subtitle={summary.totalFailed > 0 ? `${summary.totalFailed} failed` : undefined}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Yield by crop */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Yield by crop</h3>
          <HarvestChart data={topCrops} />
        </div>

        {/* Crops by family */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Crops by family</h3>
          <CropFamilyChart data={cropsByFamily} />
        </div>

        {/* Monthly activity — full width */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 mb-4">Monthly harvest activity</h3>
          <MonthlyActivityChart data={monthlyActivity} />
        </div>
      </div>

      {/* Zone breakdown */}
      {zones.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-4">By zone</h3>
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
                      <span className={`font-medium ${zone.crops > 0 && zone.harvests / zone.crops >= 0.5 ? 'text-green-600' : 'text-gray-600'}`}>
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

function StatCard({ label, value, icon, color, subtitle }: StatCardProps) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg" aria-hidden>{icon}</span>
        <span className="text-xs font-medium uppercase tracking-wide opacity-80">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs mt-0.5 opacity-70">{subtitle}</div>}
    </div>
  );
}
