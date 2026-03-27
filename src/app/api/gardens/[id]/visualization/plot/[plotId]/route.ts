import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { canReadGarden } from '@/lib/gardenAccess';
import { z } from 'zod';

/**
 * GET /api/gardens/[id]/visualization/plot/[plotId]
 * Returns detailed visualization data for a single plot including current crops and companions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; plotId: string }> }
) {
  try {
    const { id, plotId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canRead = await canReadGarden(session.user.id, id);
    if (!canRead) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const plot = await prisma.plot.findFirst({
      where: { id: plotId, zone: { gardenId: id } },
      include: {
        zone: { select: { id: true, name: true } },
        crops: {
          include: {
            plantType: true,
            events: { orderBy: { date: 'desc' } },
          },
        },
        rotationLog: {
          orderBy: { year: 'desc' },
          take: 3,
          include: { family: true },
        },
      },
    });

    if (!plot) {
      return NextResponse.json({ error: 'Plot not found' }, { status: 404 });
    }

    return NextResponse.json(plot);
  } catch (error) {
    console.error('Failed to fetch plot visualization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plot visualization' },
      { status: 500 }
    );
  }
}
