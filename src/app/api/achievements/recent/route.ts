import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getRecentAchievements } from '@/lib/achievementService';

/**
 * GET /api/achievements/recent
 * Returns the current user's 5 most recently unlocked achievements.
 * @returns Array of recent achievements
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const achievements = await getRecentAchievements(session.user.id);
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Failed to fetch recent achievements:', error);
    return NextResponse.json({ error: 'Failed to fetch recent achievements' }, { status: 500 });
  }
}
