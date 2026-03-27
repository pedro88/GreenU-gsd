import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canReadGarden, canWriteGarden } from '@/lib/gardenAccess';
import { addXpByEvent, updateStreak } from '@/lib/xpService';

/**
 * GET /api/crops/[id]
 * Get a specific crop with events.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the crop ID
 * @returns The crop with plant type and events, or an error response
 */
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up crop's garden ID
    const cropLookup = await prisma.crop.findFirst({
      where: { id },
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

    const crop = await prisma.crop.findFirst({
      where: { id },
      include: {
        plantType: {
          include: { family: true },
        },
        events: {
          orderBy: { date: 'desc' },
        },
        plot: {
          include: {
            zone: {
              include: { garden: true },
            },
          },
        },
      },
    });

    if (!crop) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    return NextResponse.json(crop);
  } catch (error) {
    console.error('Failed to fetch crop:', error);
    return NextResponse.json({ error: 'Failed to fetch crop' }, { status: 500 });
  }
}

const updateCropSchema = z.object({
  status: z
    .enum([
      'PLANTED',
      'SEEDLING',
      'VEGETATIVE',
      'FLOWERING',
      'FRUITING',
      'HARVESTING',
      'HARVESTED',
      'FAILED',
    ])
    .optional(),
  harvestedDate: z
    .string()
    .datetime()
    .or(z.date())
    .nullable()
    .transform((d) => (d ? new Date(d) : null)),
  quantity: z.number().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

/**
 * PATCH /api/crops/[id]
 * Update a crop (status, harvest, etc.) — owner or editor only.
 * @param request - The incoming HTTP request with update data
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the crop ID
 * @returns The updated crop, or an error response
 */
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up crop's garden ID
    const cropLookup = await prisma.crop.findFirst({
      where: { id },
      include: { plot: { select: { zoneId: true, zone: { select: { gardenId: true } } } } },
    });

    if (!cropLookup) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    const gardenId = cropLookup.plot.zone.gardenId;
    const canWrite = await canWriteGarden(session.user.id, gardenId);
    if (!canWrite) {
      return NextResponse.json({ error: 'Not authorized to update this crop' }, { status: 403 });
    }

    const existing = cropLookup;

    const body = await request.json();
    const validation = updateCropSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const { status, harvestedDate, quantity, notes } = validation.data;

    const crop = await prisma.crop.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(harvestedDate !== undefined && { harvestedDate }),
        ...(quantity !== undefined && { quantity }),
        ...(notes !== undefined && { notes }),
      },
      include: {
        plantType: true,
        events: { orderBy: { date: 'desc' } },
      },
    });

    // If harvested, add a harvest event
    if (status === 'HARVESTED' && !existing.harvestedDate) {
      await prisma.cultivationEvent.create({
        data: {
          cropId: id,
          eventType: 'HARVEST',
          date: harvestedDate || new Date(),
          quantity,
          notes: notes || 'Harvest recorded',
        },
      });

      // Award XP for harvest — goes to garden owner
      const garden = await prisma.garden.findUnique({
        where: { id: existing.plot.zone.gardenId },
        select: { userId: true },
      });
      if (garden) {
        addXpByEvent({
          userId: garden.userId,
          eventType: 'HARVEST',
          metadata: { cropId: id },
        }).catch(console.error);
        updateStreak(garden.userId).catch(console.error);
      }
    }

    return NextResponse.json(crop);
  } catch (error) {
    console.error('Failed to update crop:', error);
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

/**
 * DELETE /api/crops/[id]
 * Remove a crop from a plot (owner or editor only).
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - The route parameters containing the crop ID
 * @returns A success message, or an error response
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Look up crop's garden ID
    const cropLookup = await prisma.crop.findFirst({
      where: { id },
      include: { plot: { select: { zoneId: true, zone: { select: { gardenId: true } } } } },
    });

    if (!cropLookup) {
      return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
    }

    const gardenId = cropLookup.plot.zone.gardenId;
    const canWrite = await canWriteGarden(session.user.id, gardenId);
    if (!canWrite) {
      return NextResponse.json({ error: 'Not authorized to delete this crop' }, { status: 403 });
    }

    await prisma.cultivationEvent.deleteMany({ where: { cropId: id } });
    await prisma.crop.delete({ where: { id } });

    return NextResponse.json({ message: 'Crop removed successfully' });
  } catch (error) {
    console.error('Failed to delete crop:', error);
    return NextResponse.json({ error: 'Failed to delete crop' }, { status: 500 });
  }
}
