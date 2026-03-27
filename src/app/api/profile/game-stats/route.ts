import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserGameStats } from '@/lib/xpService';

/**
 * GET /api/profile/game-stats
 * Returns the current user's full gamification stats: XP, level, streak, and recent XP events.
 * Used by the profile page to display the XP bar, level badge, and activity.
 * @returns UserStats with XP progress and last 20 XP events, or an error response
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const stats = await getUserGameStats(session.user.id);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Failed to fetch game stats:', error);
    return NextResponse.json({ error: 'Failed to fetch game stats' }, { status: 500 });
  }
}
