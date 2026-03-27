import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/discover
 * Returns paginated list of public gardens for the discover feed.
 * No auth required.
 * Query params:
 *   - cursor: string (pagination cursor, garden id)
 *   - limit: number (default 20, max 50)
 *   - sort: 'recent' | 'popular' (default: 'recent')
 *   - search: string (filter by garden name)
 *   - filterCrop: string (filter by plant type name)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const cursor = searchParams.get('cursor') ?? undefined;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 50);
    const sort = searchParams.get('sort') === 'popular' ? 'popular' : 'recent';
    const search = searchParams.get('search') ?? undefined;
    const filterCrop = searchParams.get('filterCrop') ?? undefined;

    // Build where clause
    const where: Record<string, unknown> = { isPublic: true };

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    if (filterCrop) {
      where.zones = {
        some: {
          plots: {
            some: {
              crops: {
                some: {
                  plantType: { name: { contains: filterCrop, mode: 'insensitive' } },
                },
              },
            },
          },
        },
      };
    }

    const orderBy =
      sort === 'popular'
        ? { followerCount: 'desc' as const }
        : { createdAt: 'desc' as const };

    const gardens = await prisma.garden.findMany({
      where,
      take: limit + 1,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        zones: {
          select: {
            id: true,
            name: true,
            type: true,
            _count: { select: { plots: true } },
            plots: {
              select: {
                id: true,
                crops: {
                  where: { status: { not: 'HARVESTED' } },
                  select: { plantTypeId: true },
                },
              },
            },
          },
        },
      },
    });

    const hasMore = gardens.length > limit;
    const items = hasMore ? gardens.slice(0, -1) : gardens;

    // Collect all plot IDs and plant type IDs in one pass
    const plotIds = items.flatMap((g) => g.zones.flatMap((z) => z.plots.map((p) => p.id)));
    const allPlantTypeIds = Array.from(new Set(items.flatMap((g) => g.zones.flatMap((z) => z.plots.flatMap((p) => p.crops.map((c) => c.plantTypeId))))));

    // Batch fetch plant types (single query)
    const plantTypes = await prisma.plantType.findMany({
      where: { id: { in: allPlantTypeIds } },
      select: { id: true, name: true },
    });
    const plantTypeMap = new Map(plantTypes.map((p) => [p.id, p.name]));

    // Get all plant types for the filter dropdown
    const allPlantTypes = await prisma.plantType.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    const gardenCards = items.map((garden) => {
      const topCropNames = Array.from(
        new Set(
          garden.zones.flatMap((z) =>
            z.plots.flatMap((p) =>
              p.crops.map((c) => plantTypeMap.get(c.plantTypeId) as string).filter(Boolean)
            )
          )
        )
      ).slice(0, 5);

      return {
        id: garden.id,
        name: garden.name,
        description: garden.description,
        location: garden.location,
        followerCount: garden.followerCount,
        createdAt: garden.createdAt,
        owner: garden.user,
        zones: garden.zones.map((z) => ({
          id: z.id,
          name: z.name,
          type: z.type,
          plotCount: z._count.plots,
        })),
        topCrops: topCropNames,
        cropCount: topCropNames.length,
      };
    });

    const nextCursor = hasMore ? items[items.length - 1]?.id ?? null : null;

    return NextResponse.json({
      gardens: gardenCards,
      nextCursor,
      plantTypes: allPlantTypes,
    });
  } catch (error) {
    console.error('Failed to fetch discover feed:', error);
    return NextResponse.json({ error: 'Failed to fetch discover feed' }, { status: 500 });
  }
}
