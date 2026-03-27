import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/plots/[id]/companions
 * Get companion planting suggestions based on current crops in plot.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with plot ID
 * @returns Current crops with companion and incompatible plant suggestions, or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get plot with current crops
    const plot = await prisma.plot.findFirst({
      where: {
        id: id,
        zone: {
          garden: { userId: session.user.id },
        },
      },
      include: {
        crops: {
          where: {
            status: { not: 'HARVESTED' },
          },
          include: {
            plantType: {
              include: {
                family: true,
                rulesAsPlant1: {
                  include: { plant2: true },
                },
                rulesAsPlant2: {
                  include: { plant1: true },
                },
              },
            },
          },
        },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    // Collect current plants
    const currentPlants = new Set<string>();
    const companions = new Set<string>();
    const incompatibles = new Set<string>();

    for (const crop of plot.crops) {
      currentPlants.add(crop.plantType.id);
      currentPlants.add(crop.plantType.name.toLowerCase());

      // Check companion rules
      for (const rule of crop.plantType.rulesAsPlant1) {
        if (rule.relationship === 'COMPANION') {
          companions.add(rule.plant2.name);
        } else if (rule.relationship === 'INCOMPATIBLE') {
          incompatibles.add(rule.plant2.name);
        }
      }
      for (const rule of crop.plantType.rulesAsPlant2) {
        if (rule.relationship === 'COMPANION') {
          companions.add(rule.plant1.name);
        } else if (rule.relationship === 'INCOMPATIBLE') {
          incompatibles.add(rule.plant1.name);
        }
      }
    }

    // Remove current plants from suggestions
    companions.delete('');
    incompatibles.delete('');
    currentPlants.forEach((p) => {
      companions.delete(p);
      companions.delete(p.toLowerCase());
      companions.delete(p.charAt(0).toUpperCase() + p.slice(1).toLowerCase());
      incompatibles.delete(p);
      incompatibles.delete(p.toLowerCase());
    });

    // Fetch suggested plants from database
    const suggestedCompanions = await prisma.plantType.findMany({
      where: {
        name: { in: Array.from(companions) },
      },
      include: { family: true },
    });

    const suggestedIncompatibles = await prisma.plantType.findMany({
      where: {
        name: { in: Array.from(incompatibles) },
      },
      include: { family: true },
    });

    return NextResponse.json({
      currentCrops: plot.crops.map((c) => ({
        id: c.id,
        plantType: c.plantType.name,
        family: c.plantType.family.name,
        status: c.status,
        plantedDate: c.plantedDate,
      })),
      suggestions: {
        companions: suggestedCompanions.map((p) => ({
          id: p.id,
          name: p.name,
          family: p.family.name,
          daysToMaturity: p.daysToMaturity,
        })),
        incompatibles: suggestedIncompatibles.map((p) => ({
          id: p.id,
          name: p.name,
          family: p.family.name,
        })),
      },
    });
  } catch (error) {
    console.error('Failed to fetch companion suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch companion suggestions' }, { status: 500 });
  }
}
