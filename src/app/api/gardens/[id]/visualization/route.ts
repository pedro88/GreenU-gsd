import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canReadGarden, canWriteGarden } from '@/lib/gardenAccess';

/**
 * GET /api/gardens/[id]/visualization
 * Returns structured layout data for garden visualization
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canRead = await canReadGarden(session.user.id, id);
    if (!canRead) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const garden = await prisma.garden.findFirst({
      where: { id },
      include: {
        zones: {
          orderBy: { createdAt: 'asc' },
          include: {
            plots: {
              orderBy: { createdAt: 'asc' },
              include: {
                crops: {
                  where: {
                    status: { not: 'HARVESTED' },
                  },
                  include: {
                    plantType: {
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Compute visualization layout
    const COLS = 3;
    const zonesWithLayout = garden.zones.map((zone, zoneIndex) => {
      const row = Math.floor(zoneIndex / COLS);
      const col = zoneIndex % COLS;
      const plotsPerRow = Math.ceil(zone.plots.length / 2);

      return {
        id: zone.id,
        name: zone.name,
        type: zone.type,
        row,
        col,
        gridArea: `${row + 1} / ${col + 1}`,
        plots: zone.plots.map((plot, plotIndex) => ({
          id: plot.id,
          name: plot.name,
          sizeSqFt: plot.sizeSqFt,
          soilType: plot.soilType,
          plotRow: Math.floor(plotIndex / plotsPerRow),
          plotCol: plotIndex % plotsPerRow,
          crops: plot.crops.map((crop) => ({
            id: crop.id,
            name: crop.plantType.name,
            plantTypeId: crop.plantType.id,
            status: crop.status,
            plantedDate: crop.plantedDate,
            quantity: crop.quantity,
            harvestYield: crop.harvestYield,
          })),
        })),
      };
    });

    return NextResponse.json({
      id: garden.id,
      name: garden.name,
      description: garden.description,
      location: garden.location,
      zones: zonesWithLayout,
      zoneGridCols: COLS,
    });
  } catch (error) {
    console.error('Failed to fetch garden visualization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch garden visualization' },
      { status: 500 }
    );
  }
}
