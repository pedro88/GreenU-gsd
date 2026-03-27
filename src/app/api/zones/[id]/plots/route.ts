import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * POST /api/zones/[id]/plots
 * Create a new plot in a zone
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: zoneId } = await params;
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check zone ownership
    const zone = await prisma.zone.findFirst({
      where: {
        id: zoneId,
        garden: { userId: session.user.id },
      },
    });

    if (!zone) {
      return NextResponse.json({ error: 'Zone not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = z.object({
      name: z.string().min(1, 'Name is required').max(100),
      sizeSqFt: z.number().positive().optional(),
      soilType: z.string().max(50).optional(),
      notes: z.string().max(500).optional(),
    }).safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, sizeSqFt, soilType, notes } = validation.data;

    const plot = await prisma.plot.create({
      data: {
        zoneId,
        name,
        sizeSqFt,
        soilType,
        notes,
      },
      include: {
        crops: true,
      },
    });

    return NextResponse.json(plot, { status: 201 });
  } catch (error) {
    console.error('Failed to create plot:', error);
    return NextResponse.json({ error: 'Failed to create plot' }, { status: 500 });
  }
}
