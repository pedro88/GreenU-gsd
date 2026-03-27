import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAllActiveQuests } from '@/lib/questService';

/**
 * GET /api/quests
 * Returns all active quests (daily + seasonal) for the current user.
 * @returns { daily: UserQuest[], seasonal: UserQuest[] }
 */
export async function GET(): Promise<NextResponse> {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const quests = await getAllActiveQuests(session.user.id);
    return NextResponse.json(quests);
  } catch (error) {
    console.error('Failed to fetch quests:', error);
    return NextResponse.json({ error: 'Failed to fetch quests' }, { status: 500 });
  }
}
