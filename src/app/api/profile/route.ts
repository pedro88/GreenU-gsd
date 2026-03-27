import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

const updateLocationSchema = z.object({
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
});

/**
 * GET /api/profile
 * Retrieves the current authenticated user's profile including name, email, preferences, and location.
 * @param _request - The incoming Next.js request object (unused)
 * @returns JSON response with the user profile data, or an error response if unauthorized
 */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      language: true,
      latitude: true,
      longitude: true,
      followerCount: true,
      followingCount: true,
      createdAt: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

/**
 * PATCH /api/profile
 * Updates the current user's profile, specifically their location coordinates (latitude/longitude).
 * Validates the input using a Zod schema before updating.
 * @param request - The incoming Next.js request object containing the update payload
 * @returns JSON response with the updated user profile, or an error response on failure
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = updateLocationSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error.errors[0].message }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: validation.data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        language: true,
        latitude: true,
        longitude: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating profile' },
      { status: 500 }
    );
  }
}
