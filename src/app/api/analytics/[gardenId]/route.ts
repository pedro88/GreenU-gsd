import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canReadGarden } from '@/lib/gardenAccess';

/**
 * GET /api/analytics/[gardenId]
 * Returns aggregated analytics data for a garden including totals, crop yields, family breakdown, monthly activity, and zone stats.
 * @param request - The incoming Next.js request object (unused but required by Next.js routing)
 * @param root0 - Destructured route parameters
 * @param root0.params - Promise resolving to route params containing gardenId
 * @returns JSON response with analytics data, or an error response if unauthorized or garden not found
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
): Promise<NextResponse> {
  try {
    const { gardenId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canRead = await canReadGarden(session.user.id, gardenId);
    if (!canRead) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const garden = await prisma.garden.findFirst({ where: { id: gardenId } });
    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Get all crops with events for this garden
    const plots = await prisma.plot.findMany({
      where: { zone: { gardenId } },
      include: {
        zone: { select: { name: true } },
        crops: {
          include: {
            plantType: {
              select: { id: true, name: true, family: { select: { id: true, name: true } } },
            },
            events: {
              orderBy: { date: 'asc' },
              select: { eventType: true, date: true, quantity: true, notes: true },
            },
          },
        },
      },
    });

    // Total stats
    const allCrops = plots.flatMap((p) => p.crops);
    const totalPlanted = allCrops.length;
    const totalHarvested = allCrops.filter((c) => c.status === 'HARVESTED').length;
    const totalFailed = allCrops.filter((c) => c.status === 'FAILED').length;
    const successRate = totalPlanted > 0 ? Math.round((totalHarvested / totalPlanted) * 100) : 0;

    // Yields per crop type
    const yieldByPlant: Record<string, { name: string; totalYield: number; count: number }> = {};
    for (const crop of allCrops) {
      const name = crop.plantType.name;
      if (!yieldByPlant[name]) {
        yieldByPlant[name] = { name, totalYield: 0, count: 0 };
      }
      yieldByPlant[name].count += 1;
      yieldByPlant[name].totalYield +=
        crop.events.find((e) => e.eventType === 'HARVEST')?.quantity ?? 0;
    }

    const topCrops = Object.values(yieldByPlant)
      .filter((r) => r.totalYield > 0)
      .sort((a, b) => b.totalYield - a.totalYield)
      .slice(0, 8);

    // Crops by family
    const familyCounts: Record<string, number> = {};
    for (const crop of allCrops) {
      const family = crop.plantType.family.name;
      familyCounts[family] = (familyCounts[family] ?? 0) + 1;
    }
    const cropsByFamily = Object.entries(familyCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    // Monthly harvest activity (last 12 months)
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

    const harvestByMonth: Record<string, number> = {};
    for (const crop of allCrops) {
      const harvestEvent = crop.events.find((e) => e.eventType === 'HARVEST');
      if (harvestEvent) {
        const date = new Date(harvestEvent.date);
        if (date >= twelveMonthsAgo) {
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          harvestByMonth[key] = (harvestByMonth[key] ?? 0) + 1;
        }
      }
    }

    // Fill in missing months with 0
    const monthlyActivity: { month: string; label: string; harvests: number }[] = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyActivity.push({
        month: key,
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        harvests: harvestByMonth[key] ?? 0,
      });
    }

    // Zone breakdown
    const zoneStats = plots.map((p) => ({
      zone: p.zone.name,
      plots: 1,
      crops: p.crops.length,
      harvests: p.crops.filter((c) => c.status === 'HARVESTED').length,
    }));

    // Aggregate by zone
    const zoneMap: Record<string, { zone: string; crops: number; harvests: number }> = {};
    for (const stat of zoneStats) {
      if (!zoneMap[stat.zone]) zoneMap[stat.zone] = { zone: stat.zone, crops: 0, harvests: 0 };
      zoneMap[stat.zone].crops += stat.crops;
      zoneMap[stat.zone].harvests += stat.harvests;
    }

    return NextResponse.json({
      gardenId,
      gardenName: garden.name,
      summary: {
        totalPlanted,
        totalHarvested,
        totalFailed,
        activeCrops: totalPlanted - totalHarvested - totalFailed,
        successRate,
      },
      topCrops,
      cropsByFamily,
      monthlyActivity,
      zones: Object.values(zoneMap),
    });
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
