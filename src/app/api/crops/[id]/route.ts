import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canReadGarden, canWriteGarden } from '@/lib/gardenAccess';

/**
 * GET /api/crops/[id]
 * Get a specific crop with events
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
  status: z.enum(['PLANTED', 'SEEDLING', 'VEGETATIVE', 'FLOWERING', 'FRUITING', 'HARVESTING', 'HARVESTED', 'FAILED']).optional(),
  harvestedDate: z.string().datetime().or(z.date()).nullable().transform(d => d ? new Date(d) : null),
  quantity: z.number().positive().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
});

/**
 * PATCH /api/crops/[id]
 * Update a crop (status, harvest, etc.) — owner or editor
 */
export async function PATCH(
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
      return NextResponse.json({ error: 'Not authorized to update this crop' }, { status: 403 });
    }

    const existing = cropLookup;

    const body = await request.json();
    const validation = updateCropSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
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
    }

    return NextResponse.json(crop);
  } catch (error) {
    console.error('Failed to update crop:', error);
    return NextResponse.json({ error: 'Failed to update crop' }, { status: 500 });
  }
}

/**
 * DELETE /api/crops/[id]
 * Remove a crop from a plot (owner or editor)
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
