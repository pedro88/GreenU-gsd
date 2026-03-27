import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/companions/[plantType]
 * Get companion planting info for a specific plant type
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ plantType: string }> }
) {
  try {
    const { plantType } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the plant type by name or ID
    const plant = await prisma.plantType.findFirst({
      where: {
        OR: [
          { id: plantType },
          { name: { equals: plantType, mode: 'insensitive' } },
        ],
      },
      include: {
        family: true,
        rulesAsPlant1: {
          include: {
            plant2: {
              include: { family: true },
            },
          },
        },
        rulesAsPlant2: {
          include: {
            plant1: {
              include: { family: true },
            },
          },
        },
      },
    });

    if (!plant) {
      return NextResponse.json({ error: 'Plant type not found' }, { status: 404 });
    }

    // Combine rules from both perspectives
    const companions = [
      ...plant.rulesAsPlant1.map(r => ({
        plant: r.plant2,
        relationship: r.relationship,
        description: r.description,
      })),
      ...plant.rulesAsPlant2.map(r => ({
        plant: r.plant1,
        relationship: r.relationship,
        description: r.description,
      })),
    ];

    const companions_list = companions
      .filter(r => r.relationship === 'COMPANION')
      .map(r => r.plant);
    const incompatibles = companions
      .filter(r => r.relationship === 'INCOMPATIBLE')
      .map(r => r.plant);

    return NextResponse.json({
      plant: {
        id: plant.id,
        name: plant.name,
        family: plant.family,
        daysToMaturity: plant.daysToMaturity,
        spacing: plant.spacing,
        sunRequirement: plant.sunRequirement,
      },
      companions: companions_list,
      incompatibles: incompatibles,
    });
  } catch (error) {
    console.error('Failed to fetch companion info:', error);
    return NextResponse.json({ error: 'Failed to fetch companion info' }, { status: 500 });
  }
}
