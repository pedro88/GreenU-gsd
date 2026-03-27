import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/plots/[id]/rotation
 * Get crop rotation suggestions based on historical plantings.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with plot ID
 * @returns Rotation suggestions with history and guidelines, or an error response
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

    // Get plot with rotation history
    const plot = await prisma.plot.findFirst({
      where: {
        id: id,
        zone: {
          garden: { userId: session.user.id },
        },
      },
      include: {
        rotationLog: {
          include: { family: true },
          orderBy: { year: 'desc' },
        },
        crops: {
          include: {
            plantType: {
              include: { family: true },
            },
          },
          orderBy: { plantedDate: 'desc' },
          take: 10,
        },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const lastPlantingFamily = plot.rotationLog[0]?.family || null;
    const recentFamilies = plot.rotationLog.slice(0, 3).map((r) => r.familyId);

    // Get all plant families with their types
    const families = await prisma.plantFamily.findMany({
      include: {
        plantTypes: true,
      },
    });

    // Generate rotation suggestions
    const suggestions: {
      family: string;
      description: string;
      suitableTypes: string[];
      reason: string;
    }[] = [];

    for (const family of families) {
      // Skip if planted recently (3-year rotation rule)
      if (recentFamilies.includes(family.id)) {
        continue;
      }

      let description = '';
      let reason = '';

      if (family.nitrogenFixer) {
        description = `${family.name} (Legume - Nitrogen Fixer)`;
        reason = 'Legumes add nitrogen to the soil, benefiting next crops';
      } else if (family.name === 'Brassicaceae') {
        description = `${family.name} (Heavy Feeder)`;
        reason = 'Heavy feeders thrive after legumes';
      } else if (family.name === 'Solanaceae') {
        description = `${family.name} (Moderate Feeder)`;
        reason = 'Good rotation after legumes or heavy feeders';
      } else {
        description = `${family.name}`;
        reason = 'Diversifies soil nutrient usage';
      }

      suggestions.push({
        family: family.name,
        description,
        suitableTypes: family.plantTypes.map((t) => t.name),
        reason,
      });
    }

    // Sort: legumes first (if not recently planted), then others
    suggestions.sort((a, b) => {
      const aIsLegume = a.family === 'Fabaceae';
      const bIsLegume = b.family === 'Fabaceae';
      if (aIsLegume && !bIsLegume) return -1;
      if (!aIsLegume && bIsLegume) return 1;
      return 0;
    });

    return NextResponse.json({
      plot: {
        id: plot.id,
        name: plot.name,
      },
      history: {
        lastFamily: lastPlantingFamily
          ? {
              name: lastPlantingFamily.name,
              description: lastPlantingFamily.description,
            }
          : null,
        recentPlantings: plot.rotationLog.map((r) => ({
          year: r.year,
          family: r.family.name,
          season: r.season,
        })),
      },
      rotationGuidelines: {
        minYearsBetweenSameFamily: 3,
        legumeBenefit: 'Legumes fix nitrogen, benefiting heavy feeders planted next',
        heavyFeeders: ['Solanaceae', 'Brassicaceae', 'Cucurbitaceae'],
        lightFeeders: ['Allium', 'Apiaceae', 'Asteraceae', 'Chenopodiaceae'],
        nitrogenFixers: ['Fabaceae'],
      },
      suggestions: suggestions.slice(0, 5), // Top 5 suggestions
    });
  } catch (error) {
    console.error('Failed to fetch rotation suggestions:', error);
    return NextResponse.json({ error: 'Failed to fetch rotation suggestions' }, { status: 500 });
  }
}
