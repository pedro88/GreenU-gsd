import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/zones/[id]
 * Get a specific zone with plots
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

    const zone = await prisma.zone.findFirst({
      where: {
        id,
        garden: { userId: session.user.id },
      },
      include: {
        garden: true,
        plots: {
          include: {
            crops: {
              include: {
                plantType: true,
                events: { orderBy: { date: 'desc' } },
              },
            },
            rotationLog: { orderBy: { year: 'desc' }, take: 5 },
          },
        },
      },
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Failed to fetch zone:', error);
    return NextResponse.json({ error: 'Failed to fetch zone' }, { status: 500 });
  }
}

const updateZoneSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  type: z.enum(['OUTDOOR', 'GREENHOUSE', 'ORCHARD', 'INDOOR', 'TERRACE']).optional(),
});

/**
 * PATCH /api/zones/[id]
 * Update a zone
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

    // Check zone ownership
    const existing = await prisma.zone.findFirst({
      where: { id, garden: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateZoneSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const zone = await prisma.zone.update({
      where: { id },
      data: validation.data,
      include: {
        plots: true,
      },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error('Failed to update zone:', error);
    return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 });
  }
}

/**
 * DELETE /api/zones/[id]
 * Delete a zone and all its plots
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

    // Check zone ownership
    const existing = await prisma.zone.findFirst({
      where: { id, garden: { userId: session.user.id } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    await prisma.zone.delete({ where: { id } });

    return NextResponse.json({ message: 'Zone deleted successfully' });
  } catch (error) {
    console.error('Failed to delete zone:', error);
    return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 });
  }
}
