import { prisma } from '@/lib/db';
import { awardXp, ensureUserStats } from '@/lib/xpService';

/**
 * Achievement Service — handles achievement detection and unlock logic.
 *
 * Every achievement has a `criteriaType` and `criteriaValue`. The service
 * evaluates all criteria after relevant game events and creates
 * UserAchievement rows for newly unlocked ones.
 *
 * Criteria types:
 *   sow_count        — Total cultivation events of type SOWING
 *   harvest_count    — Total cultivation events of type HARVEST
 *   water_count     — Total cultivation events of type WATERING
 *   perfect_crops   — Crops with no HARVEST event where status != FAILED
 *   companion_used   — Companion planting suggestions acted upon
 *   rotation_count  — Number of rotation logs created
 *   follower_count  — User's followerCount field
 *   invite_count    — Number of invites sent
 *   message_count   — Total messages sent
 *   garden_shared   — Number of gardens with isPublic=true
 *   streak          — Current streak value
 *   level           — Current level
 *   early_action    — Any event logged before 7am local
 *   late_action     — Any event logged after 10pm local
 *   unique_plants   — Count of distinct plant types planted
 */

interface CriteriaContext {
  userId: string;
  eventType?: string;
  eventDate?: Date;
  metadata?: Record<string, string | number | boolean>;
}

/**
 * Evaluates all achievement criteria for a user and returns newly unlocked achievements.
 * Call this after any game event (cultivation, social, streak, etc.).
 *
 * @param userId - User to check achievements for
 * @param context - Current event context (type, date, metadata)
 * @returns Array of newly unlocked achievements with their XP rewards
 */
export async function checkAchievements(
  userId: string,
  context: CriteriaContext = { userId: '' }
): Promise<Array<{ code: string; name: string; icon: string; xpReward: number }>> {
  // Ensure context always has userId
  const ctx: CriteriaContext = { ...context, userId };

  // Get all locked achievements for this user
  const lockedAchievements = await prisma.achievement.findMany({
    where: {
      NOT: {
        userAchievements: { some: { userId } },
      },
    },
  });

  const newlyUnlocked: Array<{ code: string; name: string; icon: string; xpReward: number }> = [];

  for (const achievement of lockedAchievements) {
    const unlocked = await evaluateCriteria(
      userId,
      achievement.criteriaType,
      achievement.criteriaValue,
      ctx
    );

    if (unlocked) {
      await prisma.userAchievement.create({
        data: {
          userId,
          achievementId: achievement.id,
        },
      });

      // Award achievement XP bonus
      await awardXp({
        userId,
        amount: achievement.xpReward,
        reason: 'ACHIEVEMENT',
        metadata: { achievementCode: achievement.code, achievementName: achievement.name },
      });

      newlyUnlocked.push({
        code: achievement.code,
        name: achievement.name,
        icon: achievement.icon,
        xpReward: achievement.xpReward,
      });
    }
  }

  return newlyUnlocked;
}

/**
 * Evaluates a single achievement criterion.
 * Returns true if the user meets the criteria threshold.
 * @param userId
 * @param criteriaType
 * @param criteriaValue
 * @param _context
 */
async function evaluateCriteria(
  userId: string,
  criteriaType: string,
  criteriaValue: number,
  _context: CriteriaContext
): Promise<boolean> {
  switch (criteriaType) {
    case 'sow_count':
      return (await countXpEvents(userId, 'SOW')) >= criteriaValue;

    case 'harvest_count':
      return (await countXpEvents(userId, 'HARVEST')) >= criteriaValue;

    case 'water_count':
      return (await countXpEvents(userId, 'WATER')) >= criteriaValue;

    case 'streak':
      return (await getCurrentStreak(userId)) >= criteriaValue;

    case 'level':
      return (await getCurrentLevel(userId)) >= criteriaValue;

    case 'follower_count':
      return (await getFollowerCount(userId)) >= criteriaValue;

    case 'garden_shared':
      return (await countSharedGardens(userId)) >= criteriaValue;

    case 'invite_count':
      return (await countXpEvents(userId, 'INVITE_FRIEND')) >= criteriaValue;

    case 'message_count':
      return (await countMessages(userId)) >= criteriaValue;

    case 'perfect_crops':
      return (await countPerfectCrops(userId)) >= criteriaValue;

    case 'rotation_count':
      return (await countRotations(userId)) >= criteriaValue;

    case 'unique_plants':
      return (await countUniquePlantTypes(userId)) >= criteriaValue;

    case 'early_action':
      return checkEarlyAction(_context);

    case 'late_action':
      return checkLateAction(_context);

    default:
      return false;
  }
}

// ============================================
// Criteria evaluation helpers
// ============================================

/**
 *
 * @param userId
 * @param reason
 */
async function countXpEvents(userId: string, reason: string): Promise<number> {
  return prisma.xpEventLog.count({ where: { userId, reason: reason as never } });
}

/**
 *
 * @param userId
 */
async function getCurrentStreak(userId: string): Promise<number> {
  const stats = await prisma.userStats.findUnique({
    where: { id: userId },
    select: { currentStreak: true },
  });
  return stats?.currentStreak ?? 0;
}

/**
 *
 * @param userId
 */
async function getCurrentLevel(userId: string): Promise<number> {
  const stats = await prisma.userStats.findUnique({
    where: { id: userId },
    select: { level: true },
  });
  return stats?.level ?? 1;
}

/**
 *
 * @param userId
 */
async function getFollowerCount(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { followerCount: true },
  });
  return user?.followerCount ?? 0;
}

/**
 *
 * @param userId
 */
async function countSharedGardens(userId: string): Promise<number> {
  return prisma.garden.count({ where: { userId, isPublic: true } });
}

/**
 *
 * @param userId
 */
async function countMessages(userId: string): Promise<number> {
  return prisma.message.count({ where: { senderId: userId } });
}

/**
 *
 * @param userId
 */
async function countPerfectCrops(userId: string): Promise<number> {
  // Count crops in user's gardens that were successfully harvested
  const result = await prisma.crop.count({
    where: {
      status: 'HARVESTED',
      plot: {
        zone: {
          garden: {
            OR: [{ userId }, { collaborators: { some: { userId } } }],
          },
        },
      },
    },
  });
  return result;
}

/**
 *
 * @param userId
 */
async function countRotations(userId: string): Promise<number> {
  return prisma.rotationLog.count({
    where: {
      plot: {
        zone: {
          garden: {
            OR: [{ userId }, { collaborators: { some: { userId } } }],
          },
        },
      },
    },
  });
}

/**
 *
 * @param userId
 */
async function countUniquePlantTypes(userId: string): Promise<number> {
  const result = await prisma.crop.findMany({
    where: {
      plot: {
        zone: {
          garden: {
            OR: [{ userId }, { collaborators: { some: { userId } } }],
          },
        },
      },
    },
    select: { plantTypeId: true },
    distinct: ['plantTypeId'],
  });
  return result.length;
}

/**
 *
 * @param context
 */
function checkEarlyAction(context: CriteriaContext): boolean {
  if (!context.eventDate) return false;
  return context.eventDate.getHours() < 7;
}

/**
 *
 * @param context
 */
function checkLateAction(context: CriteriaContext): boolean {
  if (!context.eventDate) return false;
  return context.eventDate.getHours() >= 22;
}

// ============================================
// Public API helpers
// ============================================

/**
 * Returns all achievements with the user's unlock status.
 * @param userId - User ID
 * @returns All achievements and unlock status
 */
export async function getAllAchievementsWithStatus(userId: string) {
  const achievements = await prisma.achievement.findMany({
    orderBy: [{ category: 'asc' }, { xpReward: 'desc' }],
    include: {
      userAchievements: {
        where: { userId },
        select: { unlockedAt: true },
      },
    },
  });

  return achievements.map((ach) => ({
    id: ach.id,
    code: ach.code,
    name: ach.name,
    description: ach.description,
    icon: ach.icon,
    category: ach.category,
    rarity: ach.rarity,
    xpReward: ach.xpReward,
    unlocked: ach.userAchievements.length > 0,
    unlockedAt: ach.userAchievements[0]?.unlockedAt ?? null,
  }));
}

/**
 * Returns the user's recently unlocked achievements (last 5).
 * @param userId - User ID
 * @returns Recent achievements
 */
export async function getRecentAchievements(userId: string) {
  return prisma.userAchievement.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'desc' },
    take: 5,
    include: {
      achievement: {
        select: { code: true, name: true, icon: true, xpReward: true, rarity: true },
      },
    },
  });
}
