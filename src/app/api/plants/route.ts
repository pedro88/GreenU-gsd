import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/plants
 * List all available plant types for planting.
 * @returns All plant types grouped by family, or an error response
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plants = await prisma.plantType.findMany({
      include: {
        family: true,
      },
      orderBy: [{ family: { name: 'asc' } }, { name: 'asc' }],
    });

    // Group by family
    const byFamily = plants.reduce(
      (acc, plant) => {
        const familyName = plant.family.name;
        if (!acc[familyName]) {
          acc[familyName] = [];
        }
        acc[familyName].push({
          id: plant.id,
          name: plant.name,
          daysToMaturity: plant.daysToMaturity,
          spacing: plant.spacing,
          sunRequirement: plant.sunRequirement,
        });
        return acc;
      },
      {} as Record<
        string,
        {
          id: string;
          name: string;
          daysToMaturity: number | null;
          spacing: string | null;
          sunRequirement: string | null;
        }[]
      >
    );

    return NextResponse.json({
      plants,
      byFamily,
    });
  } catch (error) {
    console.error('Failed to fetch plants:', error);
    return NextResponse.json({ error: 'Failed to fetch plants' }, { status: 500 });
  }
}
