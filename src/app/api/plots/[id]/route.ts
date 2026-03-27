import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canReadGarden, canWriteGarden, isGardenOwner } from '@/lib/gardenAccess';

/**
 * GET /api/plots/[id]
 * Get a specific plot with crops
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

    const plot = await prisma.plot.findFirst({
      where: { id },
      include: { zone: { select: { gardenId: true } } },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const canRead = await canReadGarden(session.user.id, plot.zone.gardenId);
    if (!canRead) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    const plotWithData = await prisma.plot.findFirst({
      where: { id },
      include: {
        zone: {
          include: {
            garden: true,
          },
        },
        crops: {
          include: {
            plantType: true,
            events: { orderBy: { date: 'desc' } },
          },
        },
        rotationLog: {
          include: {
            family: true,
          },
          orderBy: { year: 'desc' },
        },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Failed to fetch plot:', error);
    return NextResponse.json({ error: 'Failed to fetch plot' }, { status: 500 });
  }
}

const updatePlotSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sizeSqFt: z.number().positive().optional().nullable(),
  soilType: z.string().max(50).optional().nullable(),
  notes: z.string().max(500).optional().nullable(),
});

/**
 * PATCH /api/plots/[id]
 * Update a plot (owner or editor)
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

    // Check plot exists and get garden ID
    const existing = await prisma.plot.findFirst({
      where: { id },
      include: { zone: { select: { gardenId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    // Owner or editor can update plots
    const canWrite = await canWriteGarden(session.user.id, existing.zone.gardenId);
    if (!canWrite) {
      return NextResponse.json({ error: 'Not authorized to update this plot' }, { status: 403 });
    }

    const body = await request.json();
    const validation = updatePlotSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const plot = await prisma.plot.update({
      where: { id },
      data: validation.data,
      include: {
        crops: true,
      },
    });

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Failed to update plot:', error);
    return NextResponse.json({ error: 'Failed to update plot' }, { status: 500 });
  }
}

/**
 * DELETE /api/plots/[id]
 * Delete a plot (owner only)
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

    // Check plot exists and get garden ID
    const existing = await prisma.plot.findFirst({
      where: { id },
      include: { zone: { select: { gardenId: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    // Only owner can delete plots
    const isOwner = await isGardenOwner(session.user.id, existing.zone.gardenId);
    if (!isOwner) {
      return NextResponse.json({ error: 'Only the garden owner can delete plots' }, { status: 403 });
    }

    await prisma.plot.delete({ where: { id } });

    return NextResponse.json({ message: 'Plot deleted successfully' });
  } catch (error) {
    console.error('Failed to delete plot:', error);
    return NextResponse.json({ error: 'Failed to delete plot' }, { status: 500 });
  }
}
