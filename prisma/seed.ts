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

  const familyMap = new Map(families.map(f => [f.name, f]));

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

  const plantMap = new Map(plantTypes.map(p => [p.name, p]));

  // ============================================
  // Companion Rules
  // ============================================
  const companionRules = [
    // Tomatoes
    { plant1: 'Tomato', plant2: 'Basil', relationship: 'COMPANION', description: 'Basil repels pests and may improve flavor' },
    { plant1: 'Tomato', plant2: 'Carrot', relationship: 'COMPANION', description: 'Carrots loosen soil for tomatoes' },
    { plant1: 'Tomato', plant2: 'Marigold', relationship: 'COMPANION', description: 'Marigolds repel nematodes and whiteflies' },
    { plant1: 'Tomato', plant2: 'Onion', relationship: 'COMPANION', description: 'Onions repel pests' },
    { plant1: 'Tomato', plant2: 'Garlic', relationship: 'COMPANION', description: 'Garlic repels spider mites' },
    { plant1: 'Tomato', plant2: 'Pole Beans', relationship: 'INCOMPATIBLE', description: 'Beans fix nitrogen, tomatoes prefer less' },
    { plant1: 'Tomato', plant2: 'Cabbage', relationship: 'INCOMPATIBLE', description: 'Both are heavy feeders, compete for nutrients' },
    { plant1: 'Tomato', plant2: 'Corn', relationship: 'INCOMPATIBLE', description: 'Both attract same pests' },
    
    // Carrots
    { plant1: 'Carrot', plant2: 'Onion', relationship: 'COMPANION', description: 'Onions repel carrot fly' },
    { plant1: 'Carrot', plant2: 'Peas', relationship: 'COMPANION', description: 'Peas fix nitrogen, carrots benefit' },
    { plant1: 'Carrot', plant2: 'Lettuce', relationship: 'COMPANION', description: 'Different root depths, space efficient' },
    { plant1: 'Carrot', plant2: 'Pole Beans', relationship: 'INCOMPATIBLE', description: 'Pole beans inhibit carrot growth' },
    
    // Cucumbers
    { plant1: 'Cucumber', plant2: 'Pole Beans', relationship: 'COMPANION', description: 'Beans fix nitrogen for heavy-feeding cucumbers' },
    { plant1: 'Cucumber', plant2: 'Peas', relationship: 'COMPANION', description: 'Peas provide nitrogen' },
    { plant1: 'Cucumber', plant2: 'Corn', relationship: 'COMPANION', description: 'Corn provides shade and wind protection' },
    { plant1: 'Cucumber', plant2: 'Basil', relationship: 'COMPANION', description: 'Basil repels cucumber beetles' },
    { plant1: 'Cucumber', plant2: 'Spinach', relationship: 'COMPANION', description: 'Good space sharing' },
    { plant1: 'Cucumber', plant2: 'Squash', relationship: 'INCOMPATIBLE', description: 'Different nutrient needs' },
    
    // Corn
    { plant1: 'Corn', plant2: 'Squash', relationship: 'COMPANION', description: 'Traditional Three Sisters planting' },
    { plant1: 'Corn', plant2: 'Pole Beans', relationship: 'COMPANION', description: 'Traditional Three Sisters planting' },
    { plant1: 'Corn', plant2: 'Tomato', relationship: 'INCOMPATIBLE', description: 'Both attract same pests' },
    
    // Beans (Three Sisters)
    { plant1: 'Pole Beans', plant2: 'Squash', relationship: 'COMPANION', description: 'Traditional Three Sisters planting' },
    { plant1: 'Pole Beans', plant2: 'Corn', relationship: 'COMPANION', description: 'Beans climb corn stalks' },
    
    // Lettuce
    { plant1: 'Lettuce', plant2: 'Carrot', relationship: 'COMPANION', description: 'Good interplanting pair' },
    { plant1: 'Lettuce', plant2: 'Onion', relationship: 'COMPANION', description: 'Onions deter pests' },
    { plant1: 'Lettuce', plant2: 'Garlic', relationship: 'COMPANION', description: 'Garlic repels aphids' },
    { plant1: 'Lettuce', plant2: 'Broccoli', relationship: 'COMPANION', description: 'Lettuce fills space while broccoli grows' },
    
    // Broccoli
    { plant1: 'Broccoli', plant2: 'Celery', relationship: 'COMPANION', description: 'Good interplanting' },
    { plant1: 'Broccoli', plant2: 'Onion', relationship: 'COMPANION', description: 'Onions repel pests' },
    { plant1: 'Broccoli', plant2: 'Garlic', relationship: 'COMPANION', description: 'Garlic deters aphids' },
    { plant1: 'Broccoli', plant2: 'Tomato', relationship: 'INCOMPATIBLE', description: 'Brassicas and tomatoes compete' },
    
    // Peppers
    { plant1: 'Pepper', plant2: 'Basil', relationship: 'COMPANION', description: 'Basil repels aphids and spider mites' },
    { plant1: 'Pepper', plant2: 'Carrot', relationship: 'COMPANION', description: 'Good space sharing' },
    { plant1: 'Pepper', plant2: 'Onion', relationship: 'COMPANION', description: 'Onions deter pests' },
    
    // Onions/Garlic (general)
    { plant1: 'Onion', plant2: 'Carrot', relationship: 'COMPANION', description: 'Classic companion pair' },
    { plant1: 'Garlic', plant2: 'Carrot', relationship: 'COMPANION', description: 'Garlic repels carrot fly' },
    { plant1: 'Garlic', plant2: 'Lettuce', relationship: 'COMPANION', description: 'Garlic repels aphids' },
    { plant1: 'Garlic', plant2: 'Broccoli', relationship: 'COMPANION', description: 'Deters aphids and cabbage worms' },
    
    // Peas
    { plant1: 'Peas', plant2: 'Carrot', relationship: 'COMPANION', description: 'Peas fix nitrogen' },
    { plant1: 'Peas', plant2: 'Corn', relationship: 'COMPANION', description: 'Corn provides support' },
    { plant1: 'Peas', plant2: 'Cucumber', relationship: 'COMPANION', description: 'Good interplanting' },
    { plant1: 'Peas', plant2: 'Onion', relationship: 'INCOMPATIBLE', description: 'Onions inhibit pea growth' },
    { plant1: 'Peas', plant2: 'Garlic', relationship: 'INCOMPATIBLE', description: 'Garlic inhibits peas' },
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
