import { prisma } from '@/lib/db';
import { ensureUserStats } from '@/lib/xpService';

/**
 * Quest Service — generates daily quests, tracks progress, awards XP on completion.
 *
 * Daily quests refresh at midnight UTC. Each day, users get 3 random quests
 * from the pool. Quests track cultivation actions (sow, harvest, water, note, etc.)
 * and award XP on completion.
 *
 * Seasonal challenges are fixed monthly quests that everyone sees.
 */

interface QuestTemplate {
  title: string;
  description: string;
  targetMetric: string;
  targetValue: number;
  xpReward: number;
  icon: string;
}

// Pool of daily quest templates — randomly picked 3 per day
const DAILY_QUEST_POOL: QuestTemplate[] = [
  {
    title: 'Plant It Up',
    description: 'Plant 3 new crops today',
    targetMetric: 'sow',
    targetValue: 3,
    xpReward: 75,
    icon: '🌱',
  },
  {
    title: 'Harvest Time',
    description: 'Harvest 2 crops today',
    targetMetric: 'harvest',
    targetValue: 2,
    xpReward: 100,
    icon: '🌻',
  },
  {
    title: 'Water Duty',
    description: 'Water your crops 5 times today',
    targetMetric: 'water',
    targetValue: 5,
    xpReward: 40,
    icon: '💧',
  },
  {
    title: 'Garden Notes',
    description: 'Add 2 notes to your crops today',
    targetMetric: 'note',
    targetValue: 2,
    xpReward: 40,
    icon: '📝',
  },
  {
    title: 'First Step',
    description: 'Plant your very first crop',
    targetMetric: 'sow',
    targetValue: 1,
    xpReward: 50,
    icon: '🌿',
  },
  {
    title: 'Care Taker',
    description: 'Perform 3 cultivation actions today',
    targetMetric: 'any',
    targetValue: 3,
    xpReward: 60,
    icon: '🤝',
  },
  {
    title: 'Prune & Trim',
    description: 'Prune your crops 2 times today',
    targetMetric: 'prune',
    targetValue: 2,
    xpReward: 30,
    icon: '✂️',
  },
  {
    title: 'Fertilize Well',
    description: 'Fertilize 3 times today',
    targetMetric: 'fertilize',
    targetValue: 3,
    xpReward: 35,
    icon: '🌿',
  },
];

/**
 * Generates or retrieves the current daily quests for a user.
 * If quests already exist for today, returns them. Otherwise generates 3 new ones.
 * @param userId - User ID
 * @returns Array of UserQuest with quest details, or null if user has no UserStats
 */
export async function getDailyQuests(userId: string) {
  const stats = await ensureUserStats(userId);

  // Check if we already have quests for today
  const todayStart = startOfUtcDay(new Date());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const existingQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      createdAt: {
        gte: todayStart,
        lt: todayEnd,
      },
      quest: {
        type: 'DAILY',
      },
    },
    include: {
      quest: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (existingQuests.length >= 3) {
    return existingQuests;
  }

  // Generate 3 new random quests
  const shuffled = [...DAILY_QUEST_POOL].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 3);

  const createdQuests = [];
  for (const template of selected) {
    // Check if this exact quest template already exists as a DAILY quest
    const existingTemplate = await prisma.quest.findFirst({
      where: { type: 'DAILY', title: template.title },
    });

    let questId: string;
    if (existingTemplate) {
      questId = existingTemplate.id;
    } else {
      const quest = await prisma.quest.create({
        data: {
          type: 'DAILY',
          title: template.title,
          description: template.description,
          targetMetric: template.targetMetric,
          targetValue: template.targetValue,
          xpReward: template.xpReward,
          icon: template.icon,
        },
      });
      questId = quest.id;
    }

    const userQuest = await prisma.userQuest.create({
      data: {
        userId,
        questId,
        progress: 0,
        completed: false,
      },
      include: {
        quest: true,
      },
    });

    createdQuests.push(userQuest);
  }

  return [...existingQuests, ...createdQuests].slice(0, 3);
}

/**
 * Updates quest progress for a user based on an action they took.
 * Called after any cultivation event.
 * @param userId - User ID
 * @param eventType - Event type (e.g. 'SOW', 'HARVEST', 'WATER')
 */
export async function updateQuestProgress(userId: string, eventType: string) {
  const todayStart = startOfUtcDay(new Date());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Get today's active quests
  const activeQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      completed: false,
      createdAt: { gte: todayStart, lt: todayEnd },
      quest: { type: 'DAILY' },
    },
    include: { quest: true },
  });

  const results = [];

  for (const uq of activeQuests) {
    const quest = uq.quest;
    const matchesMetric =
      quest.targetMetric === 'any' ||
      quest.targetMetric === eventType.toLowerCase() ||
      (quest.targetMetric === 'sow' && eventType === 'SOWING') ||
      (quest.targetMetric === 'harvest' && eventType === 'HARVEST') ||
      (quest.targetMetric === 'water' && eventType === 'WATERING') ||
      (quest.targetMetric === 'fertilize' && eventType === 'FERTILIZING') ||
      (quest.targetMetric === 'prune' && eventType === 'PRUNING') ||
      (quest.targetMetric === 'note' && eventType === 'NOTE') ||
      (quest.targetMetric === 'pest' && eventType === 'PEST_CONTROL');

    if (matchesMetric) {
      const newProgress = uq.progress + 1;
      const completed = newProgress >= quest.targetValue;

      await prisma.userQuest.update({
        where: { id: uq.id },
        data: {
          progress: newProgress,
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      if (completed) {
        // Award quest XP bonus
        const { awardXp } = await import('@/lib/xpService');
        await awardXp({
          userId,
          amount: quest.xpReward,
          reason: 'QUEST_COMPLETE',
          metadata: { questTitle: quest.title },
        });
      }

      results.push({ questId: quest.id, progress: newProgress, completed });
    }
  }

  return results;
}

/**
 * Gets seasonal quests for the current month.
 * @returns Array of seasonal quests with user progress
 */
export async function getSeasonalQuests(userId: string) {
  const now = new Date();
  const monthStart = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1);
  const monthEnd = new Date(now.getUTCFullYear(), now.getUTCMonth() + 1, 0);

  return prisma.userQuest.findMany({
    where: {
      userId,
      quest: {
        type: 'SEASONAL',
        seasonStart: { lte: monthEnd },
        seasonEnd: { gte: monthStart },
      },
    },
    include: { quest: true },
  });
}

// ============================================
// Utilities
// ============================================

function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

/**
 * Returns all active quests (daily + seasonal) for a user.
 * Combines daily quests and seasonal quests in one response.
 */
export async function getAllActiveQuests(userId: string) {
  const [daily, seasonal] = await Promise.all([getDailyQuests(userId), getSeasonalQuests(userId)]);

  return { daily, seasonal };
}
