import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * PATCH /api/gardens/[id]/access/[userId]
 * Update a collaborator's role (owner only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can change roles
    const garden = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Not authorized to manage this garden' }, { status: 403 });
    }

    const updateSchema = z.object({
      role: z.enum(['EDITOR', 'VIEWER']),
    });

    const body = await request.json();
    const validation = updateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const access = await prisma.gardenAccess.findUnique({
      where: { userId_gardenId: { userId, gardenId: id } },
    });

    if (!access) {
      return NextResponse.json({ error: 'Collaborator not found' }, { status: 404 });
    }

    const updated = await prisma.gardenAccess.update({
      where: { id: access.id },
      data: { role: validation.data.role },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to update access:', error);
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 });
  }
}

/**
 * DELETE /api/gardens/[id]/access/[userId]
 * Remove a collaborator's access (owner only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { id, userId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only owner can remove collaborators
    const garden = await prisma.garden.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Not authorized to manage this garden' }, { status: 403 });
    }

    // Cannot remove owner's own access
    if (userId === garden.userId) {
      return NextResponse.json({ error: 'Cannot remove owner access' }, { status: 400 });
    }

    await prisma.gardenAccess.deleteMany({
      where: { userId, gardenId: id },
    });

    return NextResponse.json({ message: 'Collaborator removed successfully' });
  } catch (error) {
    console.error('Failed to remove access:', error);
    return NextResponse.json({ error: 'Failed to remove collaborator' }, { status: 500 });
  }
}
