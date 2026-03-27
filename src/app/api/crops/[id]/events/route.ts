import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canReadGarden, canWriteGarden } from '@/lib/gardenAccess';
import { addXpByEvent, updateStreak } from '@/lib/xpService';

/**
 * POST /api/crops/[cropId]/events
 * Log a cultivation event for a crop (owner or editor only).
 * @param request - The incoming HTTP request with event data
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the crop ID
 * @returns The created cultivation event, or an error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const { cropId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up crop's garden ID
    const cropLookup = await prisma.crop.findFirst({
      where: { id: cropId },
      include: { plot: { select: { zoneId: true, zone: { select: { gardenId: true } } } } },
    });

    if (!cropLookup) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    const gardenId = cropLookup.plot.zone.gardenId;
    const canWrite = await canWriteGarden(session.user.id, gardenId);
    if (!canWrite) {
      return NextResponse.json(
        { error: 'Not authorized to log events for this crop' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validation = z
      .object({
        eventType: z.enum([
          'SOWING',
          'TRANSPLANTING',
          'WATERING',
          'FERTILIZING',
          'PRUNING',
          'PEST_CONTROL',
          'HARVEST',
          'NOTE',
          'OTHER',
        ]),
        date: z
          .string()
          .datetime()
          .or(z.date())
          .transform((d) => new Date(d)),
        notes: z.string().max(500).optional(),
        quantity: z.number().positive().optional(),
      })
      .safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { eventType, date, notes, quantity } = validation.data;

    const event = await prisma.cultivationEvent.create({
      data: {
        cropId,
        eventType,
        date,
        notes,
        quantity,
      },
      include: {
        crop: {
          include: {
            plantType: true,
          },
        },
      },
    });

    // If this is a harvest, update crop status
    if (eventType === 'HARVEST') {
      await prisma.crop.update({
        where: { id: cropId },
        data: {
          status: 'HARVESTED',
          harvestedDate: date,
          ...(quantity && { quantity }),
        },
      });
    }

    // Award XP and update streak — XP goes to garden owner
    const garden = await prisma.garden.findUnique({
      where: { id: gardenId },
      select: { userId: true },
    });
    if (garden) {
      addXpByEvent({
        userId: garden.userId,
        eventType,
        metadata: { cropId, eventType },
      }).catch(console.error);
      updateStreak(garden.userId).catch(console.error);
    }

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Failed to log cultivation event:', error);
    return NextResponse.json({ error: 'Failed to log cultivation event' }, { status: 500 });
  }
}

/**
 * GET /api/crops/[cropId]/events
 * Get all events for a crop (any garden reader).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the crop ID
 * @returns Array of cultivation events for the crop, or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ cropId: string }> }
) {
  try {
    const { cropId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up crop's garden ID
    const cropLookup = await prisma.crop.findFirst({
      where: { id: cropId },
      include: { plot: { select: { zoneId: true, zone: { select: { gardenId: true } } } } },
    });

    if (!cropLookup) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    const gardenId = cropLookup.plot.zone.gardenId;
    const canRead = await canReadGarden(session.user.id, gardenId);
    if (!canRead) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    const events = await prisma.cultivationEvent.findMany({
      where: { cropId },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error('Failed to fetch events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}
