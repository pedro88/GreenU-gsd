import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/gardens/activity
 * Returns recent cultivation activities for the user's gardens
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all gardens the user has access to
    const userGardenIds = await prisma.garden.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      select: { id: true },
    });

    const gardenIds = userGardenIds.map((g) => g.id);

    if (gardenIds.length === 0) {
      return NextResponse.json({ activities: [] });
    }

    // Get recent cultivation events
    const events = await prisma.cultivationEvent.findMany({
      where: {
        crop: {
          plot: {
            zone: {
              gardenId: { in: gardenIds },
            },
          },
        },
      },
      include: {
        crop: {
          include: {
            plantType: true,
            plot: {
              include: {
                zone: {
                  include: {
                    garden: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Transform to activity feed format
    const activities = events.map((event) => {
      const zone = event.crop.plot.zone;
      const garden = zone.garden;
      const plantType = event.crop.plantType;
      const plot = event.crop.plot;

      let description = '';
      let icon = '•';

      switch (event.eventType) {
        case 'SOWING':
          description = `Planted ${plantType.name} in ${plot.name}`;
          icon = '🌱';
          break;
        case 'WATERING':
          description = `Watered ${plantType.name} in ${plot.name}`;
          icon = '💧';
          break;
        case 'FERTILIZING':
          description = `Fertilized ${plantType.name} in ${plot.name}`;
          icon = '🌿';
          break;
        case 'HARVEST':
          description = `Harvested ${event.quantity || ''} ${plantType.name} from ${plot.name}`.trim();
          icon = '🌾';
          break;
        case 'NOTE':
          description = event.notes || `Added note for ${plantType.name}`;
          icon = '📝';
          break;
        default:
          description = `${event.eventType.toLowerCase()} for ${plantType.name}`;
          icon = '•';
      }

      return {
        id: event.id,
        type: event.eventType,
        description,
        createdAt: event.createdAt.toISOString(),
        gardenId: zone.gardenId,
        gardenName: garden.name,
        zoneName: zone.name,
        plotName: plot.name,
        plantName: plantType.name,
      };
    });

    // Also get zone/plot creation events
    const recentZones = await prisma.zone.findMany({
      where: { garden: { id: { in: gardenIds } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { garden: true },
    });

    const recentPlots = await prisma.plot.findMany({
      where: { zone: { garden: { id: { in: gardenIds } } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { zone: true },
    });

    // Add zone creation events
    const zoneActivities = recentZones
      .filter((z) => new Date(z.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map((zone) => ({
        id: `zone-${zone.id}`,
        type: 'ZONE_CREATED' as const,
        description: `Created zone "${zone.name}"`,
        createdAt: zone.createdAt.toISOString(),
        gardenId: zone.gardenId,
        gardenName: zone.garden.name,
        zoneName: zone.name,
        plotName: null,
        plantName: null,
      }));

    // Add plot creation events
    const plotActivities = recentPlots
      .filter((p) => new Date(p.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      .map((plot) => ({
        id: `plot-${plot.id}`,
        type: 'PLOT_CREATED' as const,
        description: `Created plot "${plot.name}" in ${plot.zone.name}`,
        createdAt: plot.createdAt.toISOString(),
        gardenId: plot.zone.gardenId,
        gardenName: plot.zone.garden.name,
        zoneName: plot.zone.name,
        plotName: plot.name,
        plantName: null,
      }));

    // Merge and sort all activities
    const allActivities = [...activities, ...zoneActivities, ...plotActivities]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10);

    return NextResponse.json({ activities: allActivities });
  } catch (error) {
    console.error('Failed to fetch activities:', error);
    return NextResponse.json({ error: 'Failed to fetch activities' }, { status: 500 });
  }
}
