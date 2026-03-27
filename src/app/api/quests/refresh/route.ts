import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDailyQuests } from '@/lib/questService';

/**
 * POST /api/quests/refresh — Manually regenerate daily quests (for testing).
 * @returns The newly generated quests
 */
export async function POST(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quests = await getDailyQuests(session.user.id);
    return NextResponse.json(quests);
  } catch (error) {
    console.error('Failed to refresh quests:', error);
    return NextResponse.json({ error: 'Failed to refresh quests' }, { status: 500 });
  }
}
