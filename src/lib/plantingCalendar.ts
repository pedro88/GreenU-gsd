/**
 * Planting calendar rules per plant type
 * Specifies weeks relative to last spring frost for key tasks
 * Weeks before frost are negative, after are positive
 */

export interface CalendarRule {
  plantTypeName: string; // Match against PlantType.name
  tasks: CalendarTask[];
}

export interface CalendarTask {
  type: 'sow_indoors' | 'sow_outdoors' | 'transplant' | 'harvest' | 'fertilize';
  weeksFromLastFrost: number; // relative to last frost date
  labelKey: string; // i18n key for task label
  icon: string;
}

/**
 * Calendar rules keyed by plant type name.
 * Covers the main plant types from the seed data.
 */
export const plantingCalendarRules: Record<string, CalendarTask[]> = {
  // Solanaceae
  Tomato: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -6,
      labelKey: 'calendar.sowTomatoIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: 2,
      labelKey: 'calendar.transplantTomato',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 12, labelKey: 'calendar.harvestTomato', icon: '🍅' },
  ],
  Pepper: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -8,
      labelKey: 'calendar.sowPepperIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: 2,
      labelKey: 'calendar.transplantPepper',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 14, labelKey: 'calendar.harvestPepper', icon: '🫑' },
  ],
  Eggplant: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -6,
      labelKey: 'calendar.sowEggplantIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: 2,
      labelKey: 'calendar.transplantEggplant',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 12, labelKey: 'calendar.harvestEggplant', icon: '🍆' },
  ],

  // Brassicaceae (Cucumbers)
  Broccoli: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -4,
      labelKey: 'calendar.sowBroccoliIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: -2,
      labelKey: 'calendar.transplantBroccoli',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 8, labelKey: 'calendar.harvestBroccoli', icon: '🥦' },
  ],
  Cabbage: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -4,
      labelKey: 'calendar.sowCabbageIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: -2,
      labelKey: 'calendar.transplantCabbage',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestCabbage', icon: '🥬' },
  ],
  Kale: [
    { type: 'sow_outdoors', weeksFromLastFrost: -3, labelKey: 'calendar.sowKale', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 6, labelKey: 'calendar.harvestKale', icon: '🥬' },
  ],

  // Cucurbitaceae
  Cucumber: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -3,
      labelKey: 'calendar.sowCucumberIndoors',
      icon: '🌱',
    },
    {
      type: 'transplant',
      weeksFromLastFrost: 2,
      labelKey: 'calendar.transplantCucumber',
      icon: '🪴',
    },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestCucumber', icon: '🥒' },
  ],
  Zucchini: [
    { type: 'sow_outdoors', weeksFromLastFrost: 2, labelKey: 'calendar.sowZucchini', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestZucchini', icon: '🥒' },
  ],
  Pumpkin: [
    { type: 'sow_outdoors', weeksFromLastFrost: 2, labelKey: 'calendar.sowPumpkin', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 18, labelKey: 'calendar.harvestPumpkin', icon: '🎃' },
  ],

  // Root vegetables
  Carrot: [
    { type: 'sow_outdoors', weeksFromLastFrost: -2, labelKey: 'calendar.sowCarrot', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 12, labelKey: 'calendar.harvestCarrot', icon: '🥕' },
  ],
  Beet: [
    { type: 'sow_outdoors', weeksFromLastFrost: -2, labelKey: 'calendar.sowBeet', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestBeet', icon: '🍎' },
  ],
  Radish: [
    { type: 'sow_outdoors', weeksFromLastFrost: -4, labelKey: 'calendar.sowRadish', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 4, labelKey: 'calendar.harvestRadish', icon: '🔴' },
  ],

  // Legumes
  Bean: [
    { type: 'sow_outdoors', weeksFromLastFrost: 1, labelKey: 'calendar.sowBean', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestBean', icon: '🫘' },
  ],
  Pea: [
    { type: 'sow_outdoors', weeksFromLastFrost: -4, labelKey: 'calendar.sowPea', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 8, labelKey: 'calendar.harvestPea', icon: '🟢' },
  ],

  // Alliums
  Onion: [
    { type: 'sow_outdoors', weeksFromLastFrost: -6, labelKey: 'calendar.sowOnion', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 16, labelKey: 'calendar.harvestOnion', icon: '🧅' },
  ],
  Garlic: [
    { type: 'sow_outdoors', weeksFromLastFrost: -40, labelKey: 'calendar.plantGarlic', icon: '🧄' }, // Fall planting
    { type: 'harvest', weeksFromLastFrost: 8, labelKey: 'calendar.harvestGarlic', icon: '🧄' },
  ],

  // Leafy greens
  Lettuce: [
    { type: 'sow_outdoors', weeksFromLastFrost: -3, labelKey: 'calendar.sowLettuce', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 6, labelKey: 'calendar.harvestLettuce', icon: '🥬' },
  ],
  Spinach: [
    { type: 'sow_outdoors', weeksFromLastFrost: -4, labelKey: 'calendar.sowSpinach', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 4, labelKey: 'calendar.harvestSpinach', icon: '🥬' },
  ],

  // Herbs
  Basil: [
    {
      type: 'sow_indoors',
      weeksFromLastFrost: -4,
      labelKey: 'calendar.sowBasilIndoors',
      icon: '🌱',
    },
    { type: 'transplant', weeksFromLastFrost: 2, labelKey: 'calendar.transplantBasil', icon: '🪴' },
    { type: 'harvest', weeksFromLastFrost: 10, labelKey: 'calendar.harvestBasil', icon: '🌿' },
  ],
  Cilantro: [
    { type: 'sow_outdoors', weeksFromLastFrost: -2, labelKey: 'calendar.sowCilantro', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 4, labelKey: 'calendar.harvestCilantro', icon: '🌿' },
  ],
  Parsley: [
    { type: 'sow_outdoors', weeksFromLastFrost: -3, labelKey: 'calendar.sowParsley', icon: '🌱' },
    { type: 'harvest', weeksFromLastFrost: 8, labelKey: 'calendar.harvestParsley', icon: '🌿' },
  ],

  // Grains
  Corn: [
    { type: 'sow_outdoors', weeksFromLastFrost: 2, labelKey: 'calendar.sowCorn', icon: '🌽' },
    { type: 'harvest', weeksFromLastFrost: 14, labelKey: 'calendar.harvestCorn', icon: '🌽' },
  ],

  // Three Sisters companion
  Squash: [
    { type: 'sow_outdoors', weeksFromLastFrost: 2, labelKey: 'calendar.sowSquash', icon: '🎃' },
    { type: 'harvest', weeksFromLastFrost: 12, labelKey: 'calendar.harvestSquash', icon: '🎃' },
  ],
};
