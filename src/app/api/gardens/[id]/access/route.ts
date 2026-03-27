import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/gardens/[id]/access
 * List all collaborators (GardenAccess records) for a garden.
 * Accessible by owner and editors.
 * @param request - The incoming HTTP request
 * @param root0 - Destructured route parameters
 * @param root0.params - Route parameters with garden ID
 * @returns Array of collaborators with user info, or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    const { id } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check access: owner or has GardenAccess
    const garden = await prisma.garden.findFirst({
      where: {
        id,
        OR: [{ userId: session.user.id }, { collaborators: { some: { userId: session.user.id } } }],
      },
    });

    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const collaborators = await prisma.gardenAccess.findMany({
      where: { gardenId: id },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Failed to list access:', error);
    return NextResponse.json({ error: 'Failed to list collaborators' }, { status: 500 });
  }
}
