import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { z } from 'zod';

/**
 * GET /api/gardens
 * List all gardens for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch owned gardens AND gardens where user is a collaborator
    const gardens = await prisma.garden.findMany({
      where: {
        OR: [
          { userId: session.user.id },
          { collaborators: { some: { userId: session.user.id } } },
        ],
      },
      include: {
        zones: {
          include: {
            plots: {
              include: {
                crops: {
                  include: {
                    plantType: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(gardens);
  } catch (error) {
    console.error('Failed to fetch gardens:', error);
    return NextResponse.json({ error: 'Failed to fetch gardens' }, { status: 500 });
  }
}

const createGardenSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  location: z.string().max(200).optional(),
});

/**
 * POST /api/gardens
 * Create a new garden
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createGardenSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name, description, location } = validation.data;

    const garden = await prisma.garden.create({
      data: {
        userId: session.user.id,
        name,
        description,
        location,
      },
      include: {
        zones: true,
      },
    });

    return NextResponse.json(garden, { status: 201 });
  } catch (error) {
    console.error('Failed to create garden:', error);
    return NextResponse.json({ error: 'Failed to create garden' }, { status: 500 });
  }
}
