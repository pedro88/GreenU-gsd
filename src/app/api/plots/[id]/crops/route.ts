import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canWriteGarden } from '@/lib/gardenAccess';
import { addXpByEvent, updateStreak } from '@/lib/xpService';
import { updateQuestProgress } from '@/lib/questService';

/**
 * POST /api/plots/[plotId]/crops
 * Plant a new crop in a plot.
 * @param request - The incoming HTTP request with crop data
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with plot ID
 * @returns The created crop record with plant type info and events, or an error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ plotId: string }> }
): Promise<NextResponse> {
  try {
    const { plotId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get plot with garden ID
    const plot = await prisma.plot.findFirst({
      where: { id: plotId },
      include: {
        zone: { select: { gardenId: true } },
        rotationLog: { orderBy: { year: 'desc' }, take: 1, include: { family: true } },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    // Owner or editor can plant crops
    const canWrite = await canWriteGarden(session.user.id, plot.zone.gardenId);
    if (!canWrite) {
      return NextResponse.json(
        { error: 'Not authorized to add crops to this garden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = z
      .object({
        plantTypeId: z.string().min(1, 'Plant type is required'),
        plantedDate: z.string().transform((s) => new Date(s + 'T12:00:00')),
        quantity: z.number().positive().optional(),
        notes: z.string().max(500).optional(),
      })
      .safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { plantTypeId, plantedDate, quantity, notes } = validation.data;

    // Verify plant type exists
    const plantType = await prisma.plantType.findUnique({
      where: { id: plantTypeId },
      include: { family: true },
    });

    if (!plantType) {
      return NextResponse.json({ error: 'Plant type not found' }, { status: 404 });
    }

    // Create crop with initial sowing event
    const crop = await prisma.crop.create({
      data: {
        plotId,
        plantTypeId,
        plantedDate,
        quantity,
        notes,
        status: 'PLANTED',
        events: {
          create: {
            eventType: 'SOWING',
            date: plantedDate,
            notes: 'Initial planting',
          },
        },
      },
      include: {
        plantType: true,
        events: true,
      },
    });

    // Log crop rotation if we have family info
    const currentYear = new Date().getFullYear();
    await prisma.rotationLog.upsert({
      where: {
        plotId_year_season: {
          plotId,
          year: currentYear,
          season: 'Year-round',
        },
      },
      create: {
        plotId,
        familyId: plantType.familyId,
        year: currentYear,
        season: 'Year-round',
      },
      update: {
        familyId: plantType.familyId,
      },
    });

    // Award XP and update streak — XP goes to garden owner
    const garden = await prisma.garden.findUnique({
      where: { id: plot.zone.gardenId },
      select: { userId: true },
    });
    if (garden) {
      addXpByEvent({
        userId: garden.userId,
        eventType: 'SOW',
        metadata: { cropId: crop.id, plantType: plantType.name },
      }).catch(console.error);
      updateStreak(garden.userId).catch(console.error);
      updateQuestProgress(garden.userId, 'SOWING').catch(console.error);
    }

    return NextResponse.json(crop, { status: 201 });
  } catch (error) {
    console.error('Failed to plant crop:', error);
    return NextResponse.json({ error: 'Failed to plant crop' }, { status: 500 });
  }
}
