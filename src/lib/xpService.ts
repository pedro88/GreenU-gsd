import { prisma } from '@/lib/db';

/**
 * XP Service — centralizes all XP award logic for the gamification system.
 *
 * Level formula: level = floor(sqrt(totalXp / 100))
 * XP thresholds by level:
 *   L1: 0 XP     L2: 100 XP    L3: 400 XP    L4: 900 XP
 *   L5: 1600 XP  L6: 2500 XP   L7: 3600 XP   L8: 4900 XP
 *
 * XP awards by action:
 *   GARDEN_CREATE: +200  SOW: +50    HARVEST: +100
 *   WATER: +10     FERTILIZE: +15   PRUNE: +10
 *   PEST_CONTROL: +20    NOTE: +15  LEVEL_UP: +50
 *   SOCIAL_SHARE: +30   FIRST_FOLLOWER: +50  INVITE: +100
 *   STREAK_BONUS: +(currentStreak × 5)
 *   QUEST_COMPLETE: varies
 *   ACHIEVEMENT: varies
 */

// ============================================
// XP amounts per action type
// ============================================

const XP_BY_ACTION: Record<string, number> = {
  GARDEN_CREATE: 200,
  SOW: 50,
  HARVEST: 100,
  WATER: 10,
  FERTILIZE: 15,
  PRUNE: 10,
  PEST_CONTROL: 20,
  NOTE: 15,
  LEVEL_UP: 50,
  SOCIAL_SHARE: 30,
  FIRST_FOLLOWER: 50,
  INVITE_FRIEND: 100,
};

/**
 * Calculates level from total accumulated XP.
 * Uses square root curve: level = floor(sqrt(totalXp / 100))
 * This gives a natural deceleration — early levels are easy, later levels require more work.
 * @param totalXp - Total XP accumulated
 * @returns Current level (minimum 1)
 */
export function calculateLevel(totalXp: number): number {
  if (totalXp < 0) return 1;
  return Math.max(1, Math.floor(Math.sqrt(totalXp / 100)));
}

/**
 * Calculates the XP required to reach the next level.
 * @param currentLevel - Current level
 * @returns XP needed to reach currentLevel + 1
 */
export function xpForLevel(currentLevel: number): number {
  return currentLevel * currentLevel * 100;
}

/**
 * Calculates XP progress toward the next level.
 * @param totalXp - Total XP accumulated
 * @returns Object with xpInLevel, xpForNextLevel, and percent progress
 */
export function xpProgress(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpForNextLevel: number;
  percent: number;
} {
  const level = calculateLevel(totalXp);
  const xpAtCurrentLevel = level * level * 100;
  const xpAtNextLevel = (level + 1) * (level + 1) * 100;
  const xpInLevel = totalXp - xpAtCurrentLevel;
  const xpForNextLevel = xpAtNextLevel - xpAtCurrentLevel;
  const percent = Math.min(100, Math.round((xpInLevel / xpForNextLevel) * 100));

  return { level, xpInLevel, xpForNextLevel, percent };
}

// ============================================
// Ensure UserStats exists for a user
// ============================================

/**
 * Gets or creates UserStats for a user.
 * Used before any XP award to ensure the row exists.
 * @param userId - User ID
 * @returns Existing or newly created UserStats
 */
export async function ensureUserStats(userId: string) {
  return prisma.userStats.upsert({
    where: { userId },
    update: {},
    create: { userId },
  });
}

// ============================================
// Core XP award function
// ============================================

export interface AwardXpOptions {
  userId: string;
  amount: number;
  reason: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Awards XP to a user, recalculates their level, and logs the event.
 * This is the single entry point for all XP awards in the system.
 *
 * @param opts.userId - User to award XP to
 * @param opts.amount - XP amount (positive integer)
 * @param opts.reason - XpReason enum value as string
 * @param opts.metadata - Optional context (e.g. { cropId, eventType })
 * @param opts
 * @returns Updated UserStats with new totalXp and level, plus whether they leveled up
 */
export async function awardXp(opts: AwardXpOptions): Promise<{
  stats: { totalXp: number; level: number; previousLevel: number };
  leveledUp: boolean;
}> {
  const { userId, amount, reason, metadata } = opts;

  if (amount <= 0) return { stats: { totalXp: 0, level: 1, previousLevel: 1 }, leveledUp: false };

  // Get current stats (create if needed)
  const stats = await ensureUserStats(userId);
  const previousLevel = stats.level;

  // Calculate new XP total
  const newTotalXp = stats.totalXp + amount;
  const newLevel = calculateLevel(newTotalXp);
  const leveledUp = newLevel > previousLevel;

  // Update UserStats and log the event in a transaction
  const [, updatedStats] = await prisma.$transaction([
    // Log the XP event
    prisma.xpEventLog.create({
      data: {
        userId,
        amount,
        reason: reason as never, // cast to enum — caller ensures valid reason
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    }),
    // Update stats
    prisma.userStats.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: newLevel,
        lastActiveDate: new Date(),
      },
    }),
  ]);

  // Check level achievements on level-up
  if (leveledUp) {
    // Dynamic import to avoid circular dependency
    import('@/lib/achievementService')
      .then(({ checkAchievements }) => checkAchievements(userId, { userId }).catch(console.error))
      .catch(console.error);
  }

  return {
    stats: {
      totalXp: updatedStats.totalXp,
      level: updatedStats.level,
      previousLevel,
    },
    leveledUp,
  };
}

// ============================================
// Convenience: award XP by action type
// ============================================

export interface AddXpByEventOptions {
  userId: string;
  eventType: string;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Awards XP based on a cultivation event type or other system action.
 * This is the main function called from API routes.
 *
 * Maps event types to XP amounts:
 *   GARDEN_CREATE → +200  SOW → +50  HARVEST → +100
 *   WATER → +10  FERTILIZE → +15  NOTE → +15
 *   PRUNE → +10  PEST_CONTROL → +20  etc.
 *
 * @param opts.userId - User to award XP to
 * @param opts.eventType - Event type string (e.g. 'HARVEST', 'SOW')
 * @param opts.metadata - Optional context for the XP log
 * @param opts
 * @returns Result of awardXp
 */
export async function addXpByEvent(opts: AddXpByEventOptions) {
  const { userId, eventType, metadata } = opts;

  const amount = XP_BY_ACTION[eventType] ?? 0;
  if (amount === 0) return null;

  return awardXp({ userId, amount, reason: eventType, metadata });
}

// ============================================
// Streak logic
// ============================================

/**
 * Updates the daily streak for a user.
 * Increments streak if this is their first action today.
 * Resets streak to 1 if more than 24 hours have passed.
 * Awards streak bonus XP.
 *
 * @param userId - User to update streak for
 * @returns Updated streak info
 */
export async function updateStreak(userId: string): Promise<{
  currentStreak: number;
  longestStreak: number;
  xpAwarded: number;
  isNewDay: boolean;
}> {
  const stats = await ensureUserStats(userId);
  const now = new Date();
  const today = startOfDay(now);
  const lastActive = startOfDay(stats.lastActiveDate);

  const daysSinceLastActive = Math.floor(
    (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = stats.currentStreak;
  let longestStreak = stats.longestStreak;
  let xpAwarded = 0;
  const isNewDay = today.getTime() > lastActive.getTime();

  if (!isNewDay) {
    // Already acted today — no streak change
    return { currentStreak: stats.currentStreak, longestStreak, xpAwarded: 0, isNewDay: false };
  }

  if (daysSinceLastActive === 1) {
    // Consecutive day — increment streak
    newStreak = stats.currentStreak + 1;
  } else {
    // Gap > 1 day or first action — reset streak
    newStreak = 1;
  }

  longestStreak = Math.max(longestStreak, newStreak);

  // Award streak bonus XP (streak × 5)
  xpAwarded = newStreak * 5;
  if (xpAwarded > 0) {
    await awardXp({ userId, amount: xpAwarded, reason: 'STREAK_BONUS' });
  }

  // Update lastActiveDate and streak counters
  await prisma.userStats.update({
    where: { userId },
    data: { currentStreak: newStreak, longestStreak, lastActiveDate: now },
  });

  // Check streak achievements
  import('@/lib/achievementService')
    .then(({ checkAchievements }) => checkAchievements(userId, { userId }).catch(console.error))
    .catch(console.error);

  return { currentStreak: newStreak, longestStreak, xpAwarded, isNewDay: true };
}

// ============================================
// Utilities
// ============================================

/**
 * Returns the start of the day (midnight) in UTC for a given date.
 * Used for streak calculation to avoid timezone issues.
 * @param date
 */
function startOfDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Get user's full gamification stats (XP, level, streak, recent events).
 * @param userId - User ID
 * @returns UserStats with recent XP events
 */
export async function getUserGameStats(userId: string) {
  const stats = await ensureUserStats(userId);

  const recentEvents = await prisma.xpEventLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return {
    ...stats,
    progress: xpProgress(stats.totalXp),
    recentEvents,
  };
}
