import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';
import { canReadGarden } from '@/lib/gardenAccess';

/**
 * GET /api/gardens/[id]
 * Get a specific garden with zones and plots.
 * Public gardens are accessible without auth (read-only, limited data).
 * Private gardens require auth and owner access.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();

    const garden = await prisma.garden.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        zones: {
          include: {
            plots: {
              include: {
                crops: {
                  include: {
                    plantType: {
                      select: { id: true, name: true },
                    },
                    events: {
                      orderBy: { date: 'desc' },
                      select: { eventType: true, date: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Private garden — require auth and either ownership or collaborator access
    if (!garden.isPublic) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      const canRead = await canReadGarden(session.user.id, id);
      if (!canRead) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json(garden);
    }

    // Public garden — accessible to anyone, return owner info for follow button
    return NextResponse.json({
      ...garden,
      // Expose owner info for follow button in public view
      owner: garden.user,
    });
  } catch (error) {
    console.error('Failed to fetch garden:', error);
    return NextResponse.json({ error: 'Failed to fetch garden' }, { status: 500 });
  }
}

const updateGardenSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  isPublic: z.boolean().optional(),
});

/**
 * PATCH /api/gardens/[id]
 * Update a garden (owner only)
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

    const existing = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const body = await request.json();
    const validation = updateGardenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const garden = await prisma.garden.update({
      where: { id },
      data: validation.data,
      include: {
        zones: {
          include: {
            plots: true,
          },
        },
      },
    });

    return NextResponse.json(garden);
  } catch (error) {
    console.error('Failed to update garden:', error);
    return NextResponse.json({ error: 'Failed to update garden' }, { status: 500 });
  }
}

/**
 * DELETE /api/gardens/[id]
 * Delete a garden and all its contents (owner only)
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

    const existing = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    await prisma.garden.delete({ where: { id } });

    return NextResponse.json({ message: 'Garden deleted successfully' });
  } catch (error) {
    console.error('Failed to delete garden:', error);
    return NextResponse.json({ error: 'Failed to delete garden' }, { status: 500 });
  }
}
