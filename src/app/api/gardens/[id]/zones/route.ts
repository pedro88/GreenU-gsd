import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canWriteGarden } from '@/lib/gardenAccess';

/**
 * POST /api/gardens/[id]/zones
 * Create a new zone in a garden (owner or editor).
 * @param request - The incoming HTTP request with zone data
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with garden ID
 * @returns The created zone record, or an error response
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify garden ownership or collaborator access (editor+)
    const canWrite = await canWriteGarden(session.user.id, id);
    if (!canWrite) {
      return NextResponse.json(
        { error: 'Not authorized to add zones to this garden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const schema = z.object({
      name: z.string().min(1).max(100),
      type: z.enum(['OUTDOOR', 'GREENHOUSE', 'ORCHARD', 'INDOOR', 'TERRACE']).optional(),
    });

    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const zone = await prisma.zone.create({
      data: {
        gardenId: id,
        name: validation.data.name,
        type: validation.data.type ?? 'OUTDOOR',
      },
    });

    return NextResponse.json(zone, { status: 201 });
  } catch (error) {
    console.error('Failed to create zone:', error);
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
  }
}
