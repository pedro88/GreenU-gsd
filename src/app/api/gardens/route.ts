import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { addXpByEvent } from '@/lib/xpService';

/**
 * GET /api/gardens
 * List all gardens for the authenticated user (owned and collaborated).
 * Returns gardens with stats: zone count, plot count, crop count, collaborator count, follower count
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch owned gardens AND gardens where user is a collaborator
    const gardens = await prisma.garden.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        zones: {
          include: {
            plots: {
              include: {
                crops: {
                  where: {
                    status: {
                      in: ['PLANTED', 'SEEDLING', 'VEGETATIVE', 'FLOWERING', 'FRUITING', 'HARVESTING'],
                    },
                  },
                },
              },
            },
          },
        },
        collaborators: {
          select: {
            id: true,
            role: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
        tasks: {
          where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
          select: { id: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats for each garden
    const gardensWithStats = gardens.map((garden) => {
      let plotCount = 0;
      let activeCropCount = 0;
      let harvestCount = 0;

      for (const zone of garden.zones) {
        plotCount += zone.plots.length;
        for (const plot of zone.plots) {
          activeCropCount += plot.crops.length;
        }
      }

      // Count collaborators (excluding owner)
      const gardenerCount = garden.collaborators.length;

      return {
        ...garden,
        stats: {
          zoneCount: garden.zones.length,
          plotCount,
          activeCropCount,
          harvestCount,
          gardenerCount,
          followerCount: garden.followerCount,
          todoCount: garden.tasks.length,
        },
        // Include user's role in this garden
        userRole: garden.userId === session.user.id
          ? 'owner'
          : garden.collaborators.find((c) => c.user.id === session.user.id)?.role || 'viewer',
      };
    });

    // Also fetch main garden ID from user settings
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId: session.user.id },
      select: { mainGardenId: true },
    });

    return NextResponse.json({
      gardens: gardensWithStats,
      mainGardenId: userSettings?.mainGardenId,
    });
  } catch (error) {
    console.error('Failed to fetch gardens:', error);
    return NextResponse.json({ error: 'Failed to fetch gardens' }, { status: 500 });
  }
}

const createGardenSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
});

/**
 * POST /api/gardens
 * Create a new garden.
 * @param request - The incoming HTTP request with garden data
 * @returns The created garden record, or an error response
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createGardenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { name, description, location } = validation.data;

    // Create the garden
    const garden = await prisma.garden.create({
      data: {
        userId: session.user.id,
        name,
        description,
        location,
      },
      include: {
        zones: true,
        collaborators: true,
      },
    });

    // Set as main garden if this is the user's first garden
    const existingGardens = await prisma.garden.count({
      where: { userId: session.user.id },
    });

    if (existingGardens === 1) {
      // First garden - set as main
      await prisma.userSettings.upsert({
        where: { userId: session.user.id },
        create: { userId: session.user.id, mainGardenId: garden.id },
        update: { mainGardenId: garden.id },
      });
    }

    // Award XP for first garden creation
    addXpByEvent({
      userId: session.user.id,
      eventType: 'GARDEN_CREATE',
      metadata: { gardenId: garden.id },
    }).catch(console.error);

    // Return garden with userRole and stats
    return NextResponse.json({
      ...garden,
      stats: {
        zoneCount: 0,
        plotCount: 0,
        activeCropCount: 0,
        harvestCount: 0,
        gardenerCount: 0,
        followerCount: 0,
        todoCount: 0,
      },
      userRole: 'owner',
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to create garden:', error);
    return NextResponse.json({ error: 'Failed to create garden' }, { status: 500 });
  }
}
