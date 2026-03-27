import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Seed script for plant knowledge base
 * Run with: npx ts-node prisma/seed.ts
 */
async function main() {
  console.log('Seeding plant knowledge base...');

  // Clear existing data
  await prisma.companionRule.deleteMany();
  await prisma.plantType.deleteMany();
  await prisma.plantFamily.deleteMany();
  await prisma.rotationLog.deleteMany();

  // ============================================
  // Plant Families
  // ============================================
  const families = await Promise.all([
    prisma.plantFamily.create({
      data: {
        name: 'Solanaceae',
        description: 'Nightshade family: tomatoes, peppers, eggplant, potatoes',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Brassicaceae',
        description: 'Cabbage family: broccoli, cabbage, kale, cauliflower, Brussels sprouts',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Fabaceae',
        description: 'Legume family: beans, peas, lentils, clover, peanuts',
        nitrogenFixer: true,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Cucurbitaceae',
        description: 'Gourd family: cucumbers, squash, melons, pumpkins, zucchini',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Apiaceae',
        description: 'Carrot family: carrots, celery, parsley, dill, fennel',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Asteraceae',
        description: 'Daisy family: lettuce, sunflower, artichoke, chrysanthemum',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Allium',
        description: 'Onion family: onions, garlic, leeks, shallots, chives',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Chenopodiaceae',
        description: 'Beet family: beets, spinach, chard, quinoa',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Poaceae',
        description: 'Grass family: corn, wheat, rice, oats, barley',
        nitrogenFixer: false,
      },
    }),
    prisma.plantFamily.create({
      data: {
        name: 'Lamiaceae',
        description: 'Mint family: basil, mint, rosemary, thyme, oregano, sage',
        nitrogenFixer: false,
      },
    }),
  ]);

  const familyMap = new Map(families.map((f) => [f.name, f]));

  // ============================================
  // Plant Types
  // ============================================
  const plantTypes = await Promise.all([
    // Solanaceae
    prisma.plantType.create({
      data: {
        name: 'Tomato',
        familyId: familyMap.get('Solanaceae')!.id,
        daysToMaturity: 75,
        plantingDepth: '1/4 inch',
        spacing: '24-36 inches',
        sunRequirement: 'Full sun (6-8 hours)',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Pepper',
        familyId: familyMap.get('Solanaceae')!.id,
        daysToMaturity: 70,
        plantingDepth: '1/4 inch',
        spacing: '18-24 inches',
        sunRequirement: 'Full sun (6-8 hours)',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Eggplant',
        familyId: familyMap.get('Solanaceae')!.id,
        daysToMaturity: 80,
        plantingDepth: '1/4 inch',
        spacing: '24-30 inches',
        sunRequirement: 'Full sun (6-8 hours)',
      },
    }),
    // Brassicaceae
    prisma.plantType.create({
      data: {
        name: 'Broccoli',
        familyId: familyMap.get('Brassicaceae')!.id,
        daysToMaturity: 60,
        plantingDepth: '1/4-1/2 inch',
        spacing: '18-24 inches',
        sunRequirement: 'Full sun to partial shade',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Cabbage',
        familyId: familyMap.get('Brassicaceae')!.id,
        daysToMaturity: 70,
        plantingDepth: '1/4-1/2 inch',
        spacing: '12-18 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Kale',
        familyId: familyMap.get('Brassicaceae')!.id,
        daysToMaturity: 55,
        plantingDepth: '1/4-1/2 inch',
        spacing: '12-18 inches',
        sunRequirement: 'Partial to full sun',
      },
    }),
    // Fabaceae
    prisma.plantType.create({
      data: {
        name: 'Pole Beans',
        familyId: familyMap.get('Fabaceae')!.id,
        daysToMaturity: 65,
        plantingDepth: '1 inch',
        spacing: '6 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Bush Beans',
        familyId: familyMap.get('Fabaceae')!.id,
        daysToMaturity: 55,
        plantingDepth: '1 inch',
        spacing: '4-6 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Peas',
        familyId: familyMap.get('Fabaceae')!.id,
        daysToMaturity: 60,
        plantingDepth: '1-2 inches',
        spacing: '3-4 inches',
        sunRequirement: 'Full sun to partial shade',
      },
    }),
    // Cucurbitaceae
    prisma.plantType.create({
      data: {
        name: 'Cucumber',
        familyId: familyMap.get('Cucurbitaceae')!.id,
        daysToMaturity: 55,
        plantingDepth: '1 inch',
        spacing: '12-18 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Squash',
        familyId: familyMap.get('Cucurbitaceae')!.id,
        daysToMaturity: 50,
        plantingDepth: '1 inch',
        spacing: '24-36 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Zucchini',
        familyId: familyMap.get('Cucurbitaceae')!.id,
        daysToMaturity: 45,
        plantingDepth: '1 inch',
        spacing: '24-36 inches',
        sunRequirement: 'Full sun',
      },
    }),
    // Apiaceae
    prisma.plantType.create({
      data: {
        name: 'Carrot',
        familyId: familyMap.get('Apiaceae')!.id,
        daysToMaturity: 70,
        plantingDepth: '1/4 inch',
        spacing: '2-3 inches',
        sunRequirement: 'Full sun to partial shade',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Celery',
        familyId: familyMap.get('Apiaceae')!.id,
        daysToMaturity: 100,
        plantingDepth: 'Surface sow',
        spacing: '8-12 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Parsley',
        familyId: familyMap.get('Apiaceae')!.id,
        daysToMaturity: 75,
        plantingDepth: '1/4 inch',
        spacing: '6-8 inches',
        sunRequirement: 'Partial shade',
      },
    }),
    // Asteraceae
    prisma.plantType.create({
      data: {
        name: 'Lettuce',
        familyId: familyMap.get('Asteraceae')!.id,
        daysToMaturity: 45,
        plantingDepth: '1/8 inch',
        spacing: '6-12 inches',
        sunRequirement: 'Partial shade',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Spinach',
        familyId: familyMap.get('Chenopodiaceae')!.id,
        daysToMaturity: 40,
        plantingDepth: '1/2 inch',
        spacing: '4-6 inches',
        sunRequirement: 'Partial shade',
      },
    }),
    // Allium
    prisma.plantType.create({
      data: {
        name: 'Onion',
        familyId: familyMap.get('Allium')!.id,
        daysToMaturity: 100,
        plantingDepth: '1/4-1/2 inch',
        spacing: '4-6 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Garlic',
        familyId: familyMap.get('Allium')!.id,
        daysToMaturity: 240,
        plantingDepth: '2 inches',
        spacing: '6 inches',
        sunRequirement: 'Full sun',
      },
    }),
    // Poaceae
    prisma.plantType.create({
      data: {
        name: 'Corn',
        familyId: familyMap.get('Poaceae')!.id,
        daysToMaturity: 75,
        plantingDepth: '1-2 inches',
        spacing: '12 inches',
        sunRequirement: 'Full sun',
      },
    }),
    // Lamiaceae
    prisma.plantType.create({
      data: {
        name: 'Basil',
        familyId: familyMap.get('Lamiaceae')!.id,
        daysToMaturity: 30,
        plantingDepth: '1/4 inch',
        spacing: '12-18 inches',
        sunRequirement: 'Full sun',
      },
    }),
    prisma.plantType.create({
      data: {
        name: 'Marigold',
        familyId: familyMap.get('Asteraceae')!.id,
        daysToMaturity: 50,
        plantingDepth: '1/4 inch',
        spacing: '8-10 inches',
        sunRequirement: 'Full sun',
      },
    }),
  ]);

  const plantMap = new Map(plantTypes.map((p) => [p.name, p]));

  // ============================================
  // Companion Rules
  // ============================================
  const companionRules = [
    // Tomatoes
    {
      plant1: 'Tomato',
      plant2: 'Basil',
      relationship: 'COMPANION',
      description: 'Basil repels pests and may improve flavor',
    },
    {
      plant1: 'Tomato',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Carrots loosen soil for tomatoes',
    },
    {
      plant1: 'Tomato',
      plant2: 'Marigold',
      relationship: 'COMPANION',
      description: 'Marigolds repel nematodes and whiteflies',
    },
    {
      plant1: 'Tomato',
      plant2: 'Onion',
      relationship: 'COMPANION',
      description: 'Onions repel pests',
    },
    {
      plant1: 'Tomato',
      plant2: 'Garlic',
      relationship: 'COMPANION',
      description: 'Garlic repels spider mites',
    },
    {
      plant1: 'Tomato',
      plant2: 'Pole Beans',
      relationship: 'INCOMPATIBLE',
      description: 'Beans fix nitrogen, tomatoes prefer less',
    },
    {
      plant1: 'Tomato',
      plant2: 'Cabbage',
      relationship: 'INCOMPATIBLE',
      description: 'Both are heavy feeders, compete for nutrients',
    },
    {
      plant1: 'Tomato',
      plant2: 'Corn',
      relationship: 'INCOMPATIBLE',
      description: 'Both attract same pests',
    },

    // Carrots
    {
      plant1: 'Carrot',
      plant2: 'Onion',
      relationship: 'COMPANION',
      description: 'Onions repel carrot fly',
    },
    {
      plant1: 'Carrot',
      plant2: 'Peas',
      relationship: 'COMPANION',
      description: 'Peas fix nitrogen, carrots benefit',
    },
    {
      plant1: 'Carrot',
      plant2: 'Lettuce',
      relationship: 'COMPANION',
      description: 'Different root depths, space efficient',
    },
    {
      plant1: 'Carrot',
      plant2: 'Pole Beans',
      relationship: 'INCOMPATIBLE',
      description: 'Pole beans inhibit carrot growth',
    },

    // Cucumbers
    {
      plant1: 'Cucumber',
      plant2: 'Pole Beans',
      relationship: 'COMPANION',
      description: 'Beans fix nitrogen for heavy-feeding cucumbers',
    },
    {
      plant1: 'Cucumber',
      plant2: 'Peas',
      relationship: 'COMPANION',
      description: 'Peas provide nitrogen',
    },
    {
      plant1: 'Cucumber',
      plant2: 'Corn',
      relationship: 'COMPANION',
      description: 'Corn provides shade and wind protection',
    },
    {
      plant1: 'Cucumber',
      plant2: 'Basil',
      relationship: 'COMPANION',
      description: 'Basil repels cucumber beetles',
    },
    {
      plant1: 'Cucumber',
      plant2: 'Spinach',
      relationship: 'COMPANION',
      description: 'Good space sharing',
    },
    {
      plant1: 'Cucumber',
      plant2: 'Squash',
      relationship: 'INCOMPATIBLE',
      description: 'Different nutrient needs',
    },

    // Corn
    {
      plant1: 'Corn',
      plant2: 'Squash',
      relationship: 'COMPANION',
      description: 'Traditional Three Sisters planting',
    },
    {
      plant1: 'Corn',
      plant2: 'Pole Beans',
      relationship: 'COMPANION',
      description: 'Traditional Three Sisters planting',
    },
    {
      plant1: 'Corn',
      plant2: 'Tomato',
      relationship: 'INCOMPATIBLE',
      description: 'Both attract same pests',
    },

    // Beans (Three Sisters)
    {
      plant1: 'Pole Beans',
      plant2: 'Squash',
      relationship: 'COMPANION',
      description: 'Traditional Three Sisters planting',
    },
    {
      plant1: 'Pole Beans',
      plant2: 'Corn',
      relationship: 'COMPANION',
      description: 'Beans climb corn stalks',
    },

    // Lettuce
    {
      plant1: 'Lettuce',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Good interplanting pair',
    },
    {
      plant1: 'Lettuce',
      plant2: 'Onion',
      relationship: 'COMPANION',
      description: 'Onions deter pests',
    },
    {
      plant1: 'Lettuce',
      plant2: 'Garlic',
      relationship: 'COMPANION',
      description: 'Garlic repels aphids',
    },
    {
      plant1: 'Lettuce',
      plant2: 'Broccoli',
      relationship: 'COMPANION',
      description: 'Lettuce fills space while broccoli grows',
    },

    // Broccoli
    {
      plant1: 'Broccoli',
      plant2: 'Celery',
      relationship: 'COMPANION',
      description: 'Good interplanting',
    },
    {
      plant1: 'Broccoli',
      plant2: 'Onion',
      relationship: 'COMPANION',
      description: 'Onions repel pests',
    },
    {
      plant1: 'Broccoli',
      plant2: 'Garlic',
      relationship: 'COMPANION',
      description: 'Garlic deters aphids',
    },
    {
      plant1: 'Broccoli',
      plant2: 'Tomato',
      relationship: 'INCOMPATIBLE',
      description: 'Brassicas and tomatoes compete',
    },

    // Peppers
    {
      plant1: 'Pepper',
      plant2: 'Basil',
      relationship: 'COMPANION',
      description: 'Basil repels aphids and spider mites',
    },
    {
      plant1: 'Pepper',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Good space sharing',
    },
    {
      plant1: 'Pepper',
      plant2: 'Onion',
      relationship: 'COMPANION',
      description: 'Onions deter pests',
    },

    // Onions/Garlic (general)
    {
      plant1: 'Onion',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Classic companion pair',
    },
    {
      plant1: 'Garlic',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Garlic repels carrot fly',
    },
    {
      plant1: 'Garlic',
      plant2: 'Lettuce',
      relationship: 'COMPANION',
      description: 'Garlic repels aphids',
    },
    {
      plant1: 'Garlic',
      plant2: 'Broccoli',
      relationship: 'COMPANION',
      description: 'Deters aphids and cabbage worms',
    },

    // Peas
    {
      plant1: 'Peas',
      plant2: 'Carrot',
      relationship: 'COMPANION',
      description: 'Peas fix nitrogen',
    },
    {
      plant1: 'Peas',
      plant2: 'Corn',
      relationship: 'COMPANION',
      description: 'Corn provides support',
    },
    {
      plant1: 'Peas',
      plant2: 'Cucumber',
      relationship: 'COMPANION',
      description: 'Good interplanting',
    },
    {
      plant1: 'Peas',
      plant2: 'Onion',
      relationship: 'INCOMPATIBLE',
      description: 'Onions inhibit pea growth',
    },
    {
      plant1: 'Peas',
      plant2: 'Garlic',
      relationship: 'INCOMPATIBLE',
      description: 'Garlic inhibits peas',
    },
  ];

  for (const rule of companionRules) {
    const plant1 = plantMap.get(rule.plant1);
    const plant2 = plantMap.get(rule.plant2);

    if (plant1 && plant2) {
      await prisma.companionRule.create({
        data: {
          plant1Id: plant1.id,
          plant2Id: plant2.id,
          relationship: rule.relationship as 'COMPANION' | 'INCOMPATIBLE' | 'NEUTRAL',
          description: rule.description,
        },
      });
    }
  }

  console.log('Plant knowledge base seeded successfully!');
  console.log(`- ${families.length} plant families`);
  console.log(`- ${plantTypes.length} plant types`);
  console.log(`- ${companionRules.length} companion rules`);

  // ============================================
  // Achievement Seed Data
  // ============================================
  console.log('\nSeeding achievements...');

  const achievements = [
    // === CULTIVATION ===
    {
      code: 'first_seed',
      name: 'First Seed',
      description: 'Plant your very first crop',
      icon: '🌱',
      category: 'CULTIVATION' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'sow_count',
      criteriaValue: 1,
      xpReward: 50,
    },
    {
      code: 'plant_25',
      name: 'Green Thumb',
      description: 'Plant 25 crops total',
      icon: '🌿',
      category: 'CULTIVATION' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'sow_count',
      criteriaValue: 25,
      xpReward: 150,
    },
    {
      code: 'plant_100',
      name: 'Master Gardener',
      description: 'Plant 100 crops total',
      icon: '🏡',
      category: 'CULTIVATION' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'sow_count',
      criteriaValue: 100,
      xpReward: 500,
    },
    {
      code: 'first_harvest',
      name: 'First Harvest',
      description: 'Harvest your first crop',
      icon: '🌻',
      category: 'CULTIVATION' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'harvest_count',
      criteriaValue: 1,
      xpReward: 75,
    },
    {
      code: 'harvest_10',
      name: 'Bountiful Harvest',
      description: 'Harvest 10 crops',
      icon: '🧺',
      category: 'CULTIVATION' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'harvest_count',
      criteriaValue: 10,
      xpReward: 200,
    },
    {
      code: 'harvest_50',
      name: 'Crop Champion',
      description: 'Harvest 50 crops',
      icon: '🏆',
      category: 'CULTIVATION' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'harvest_count',
      criteriaValue: 50,
      xpReward: 400,
    },
    {
      code: 'harvest_100',
      name: 'Harvest Legend',
      description: 'Harvest 100 crops',
      icon: '⚡',
      category: 'CULTIVATION' as const,
      rarity: 'RARE' as const,
      criteriaType: 'harvest_count',
      criteriaValue: 100,
      xpReward: 800,
    },
    {
      code: 'perfect_plot',
      name: 'Perfect Plot',
      description: 'Plant 5 crops with zero failures',
      icon: '✨',
      category: 'CULTIVATION' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'perfect_crops',
      criteriaValue: 5,
      xpReward: 250,
    },
    {
      code: 'companion_master',
      name: 'Companion Master',
      description: 'Use companion planting rules 20 times',
      icon: '🤝',
      category: 'CULTIVATION' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'companion_used',
      criteriaValue: 20,
      xpReward: 200,
    },
    {
      code: 'rotation_pro',
      name: 'Rotation Pro',
      description: 'Complete 3 crop rotations in your garden',
      icon: '🔄',
      category: 'CULTIVATION' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'rotation_count',
      criteriaValue: 3,
      xpReward: 300,
    },
    {
      code: 'water_50',
      name: 'Diligent Waterer',
      description: 'Water your crops 50 times',
      icon: '💧',
      category: 'CULTIVATION' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'water_count',
      criteriaValue: 50,
      xpReward: 100,
    },

    // === SOCIAL ===
    {
      code: 'first_share',
      name: 'First Share',
      description: 'Share your garden publicly',
      icon: '🌍',
      category: 'SOCIAL' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'garden_shared',
      criteriaValue: 1,
      xpReward: 100,
    },
    {
      code: 'first_follower',
      name: 'First Follower',
      description: 'Get your first follower',
      icon: '👤',
      category: 'SOCIAL' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'follower_count',
      criteriaValue: 1,
      xpReward: 100,
    },
    {
      code: 'reach_10_followers',
      name: 'Growing Community',
      description: 'Reach 10 followers',
      icon: '👥',
      category: 'SOCIAL' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'follower_count',
      criteriaValue: 10,
      xpReward: 250,
    },
    {
      code: 'reach_50_followers',
      name: 'Garden Influencer',
      description: 'Reach 50 followers',
      icon: '⭐',
      category: 'SOCIAL' as const,
      rarity: 'RARE' as const,
      criteriaType: 'follower_count',
      criteriaValue: 50,
      xpReward: 500,
    },
    {
      code: 'first_message',
      name: 'First Message',
      description: 'Send your first message',
      icon: '💬',
      category: 'SOCIAL' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'message_count',
      criteriaValue: 1,
      xpReward: 50,
    },
    {
      code: 'invite_friend',
      name: 'Green Ambassador',
      description: 'Invite a friend to join greenU',
      icon: '🎁',
      category: 'SOCIAL' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'invite_count',
      criteriaValue: 1,
      xpReward: 200,
    },

    // === STREAKS ===
    {
      code: 'streak_3',
      name: 'Getting Started',
      description: 'Maintain a 3-day activity streak',
      icon: '🔥',
      category: 'STREAKS' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'streak',
      criteriaValue: 3,
      xpReward: 50,
    },
    {
      code: 'streak_7',
      name: 'Week Warrior',
      description: 'Maintain a 7-day activity streak',
      icon: '⚡',
      category: 'STREAKS' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'streak',
      criteriaValue: 7,
      xpReward: 150,
    },
    {
      code: 'streak_30',
      name: 'Monthly Master',
      description: 'Maintain a 30-day activity streak',
      icon: '🌟',
      category: 'STREAKS' as const,
      rarity: 'RARE' as const,
      criteriaType: 'streak',
      criteriaValue: 30,
      xpReward: 500,
    },
    {
      code: 'streak_100',
      name: 'Century Gardener',
      description: 'Maintain a 100-day activity streak',
      icon: '👑',
      category: 'STREAKS' as const,
      rarity: 'EPIC' as const,
      criteriaType: 'streak',
      criteriaValue: 100,
      xpReward: 1500,
    },

    // === LEVELS ===
    {
      code: 'level_5',
      name: 'Seedling',
      description: 'Reach level 5',
      icon: '🌱',
      category: 'LEVELS' as const,
      rarity: 'COMMON' as const,
      criteriaType: 'level',
      criteriaValue: 5,
      xpReward: 100,
    },
    {
      code: 'level_10',
      name: 'Growing Strong',
      description: 'Reach level 10',
      icon: '🌿',
      category: 'LEVELS' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'level',
      criteriaValue: 10,
      xpReward: 250,
    },
    {
      code: 'level_25',
      name: 'Garden Sage',
      description: 'Reach level 25',
      icon: '📚',
      category: 'LEVELS' as const,
      rarity: 'RARE' as const,
      criteriaType: 'level',
      criteriaValue: 25,
      xpReward: 750,
    },
    {
      code: 'level_50',
      name: 'Cultivation Master',
      description: 'Reach level 50',
      icon: '🎓',
      category: 'LEVELS' as const,
      rarity: 'EPIC' as const,
      criteriaType: 'level',
      criteriaValue: 50,
      xpReward: 2000,
    },

    // === SPECIAL ===
    {
      code: 'early_bird',
      name: 'Early Bird',
      description: 'Log an activity before 7am',
      icon: '🐦',
      category: 'SPECIAL' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'early_action',
      criteriaValue: 1,
      xpReward: 100,
    },
    {
      code: 'night_owl',
      name: 'Night Owl',
      description: 'Log an activity after 10pm',
      icon: '🦉',
      category: 'SPECIAL' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'late_action',
      criteriaValue: 1,
      xpReward: 100,
    },
    {
      code: 'diverse_garden',
      name: 'Diversity Champion',
      description: 'Grow 10 different plant types',
      icon: '🎨',
      category: 'SPECIAL' as const,
      rarity: 'UNCOMMON' as const,
      criteriaType: 'unique_plants',
      criteriaValue: 10,
      xpReward: 300,
    },
  ];

  const createdAchievements = [];
  for (const ach of achievements) {
    const existing = await prisma.achievement.findUnique({ where: { code: ach.code } });
    if (!existing) {
      const created = await prisma.achievement.create({ data: ach });
      createdAchievements.push(created);
    }
  }

  console.log(
    `Achievements seeded: ${createdAchievements.length} new (${achievements.length} total)`
  );

  // ============================================
  // Seasonal Quest Seed Data
  // ============================================
  console.log('\nSeeding seasonal quests...');

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const seasonalQuests = [
    {
      type: 'SEASONAL' as const,
      title: 'March Madness',
      description: 'Plant 20 crops this month',
      targetMetric: 'sow',
      targetValue: 20,
      xpReward: 500,
      icon: '🌱',
      seasonStart: monthStart,
      seasonEnd: monthEnd,
    },
    {
      type: 'SEASONAL' as const,
      title: 'Harvest Champion',
      description: 'Harvest 15 crops this month',
      targetMetric: 'harvest',
      targetValue: 15,
      xpReward: 400,
      icon: '🌻',
      seasonStart: monthStart,
      seasonEnd: monthEnd,
    },
    {
      type: 'SEASONAL' as const,
      title: 'Streak Builder',
      description: 'Maintain a 14-day activity streak',
      targetMetric: 'streak',
      targetValue: 14,
      xpReward: 350,
      icon: '🔥',
      seasonStart: monthStart,
      seasonEnd: monthEnd,
    },
  ];

  let questsCreated = 0;
  for (const quest of seasonalQuests) {
    const existing = await prisma.quest.findFirst({
      where: { title: quest.title, seasonStart: quest.seasonStart },
    });
    if (!existing) {
      await prisma.quest.create({ data: quest });
      questsCreated++;
    }
  }

  console.log(`Seasonal quests seeded: ${questsCreated}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
