import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllAchievementsWithStatus } from '@/lib/achievementService';

/**
 * GET /api/achievements
 * Returns all achievements with the current user's unlock status.
 * @returns Array of achievements with locked/unlocked state
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const achievements = await getAllAchievementsWithStatus(session.user.id);
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch achievements' }, { status: 500 });
  }
}
