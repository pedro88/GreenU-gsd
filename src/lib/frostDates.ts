/**
 * Frost date database by climate zone
 * Maps common zone classifications to last/first frost dates
 * Based on USDA Hardiness Zones and approximate growing regions
 */

export interface FrostDates {
  lastSpringFrost: string; // MM-DD format
  firstFallFrost: string;  // MM-MM format
}

export interface ClimateZone {
  zone: string;
  label: string;
  lastSpringFrost: string;
  firstFallFrost: string;
}

/**
 * Hardcoded frost dates per approximate climate region.
 * Users set their region via language/latitude.
 * These are conservative average dates.
 */
export const climateZones: Record<string, ClimateZone> = {
  // North America (English)
  'us-northeast': {
    zone: 'us-northeast',
    label: 'Northeast US (Zone 5-6)',
    lastSpringFrost: '05-15',
    firstFallFrost: '09-30',
  },
  'us-southeast': {
    zone: 'us-southeast',
    label: 'Southeast US (Zone 7-8)',
    lastSpringFrost: '04-01',
    firstFallFrost: '11-01',
  },
  'us-midwest': {
    zone: 'us-midwest',
    label: 'Midwest US (Zone 4-5)',
    lastSpringFrost: '05-10',
    firstFallFrost: '10-01',
  },
  'us-west': {
    zone: 'us-west',
    label: 'West Coast US (Zone 8-9)',
    lastSpringFrost: '03-15',
    firstFallFrost: '11-15',
  },
  'us-southwest': {
    zone: 'us-southwest',
    label: 'Southwest US (Zone 9-10)',
    lastSpringFrost: '02-15',
    firstFallFrost: '12-01',
  },

  // Europe (French)
  'fr-north': {
    zone: 'fr-north',
    label: 'Northern France / Belgium',
    lastSpringFrost: '04-15',
    firstFallFrost: '10-15',
  },
  'fr-south': {
    zone: 'fr-south',
    label: 'Southern France',
    lastSpringFrost: '03-15',
    firstFallFrost: '11-15',
  },
  'es': {
    zone: 'es',
    label: 'Spain',
    lastSpringFrost: '03-01',
    firstFallFrost: '11-30',
  },
  'de': {
    zone: 'de',
    label: 'Germany / Central Europe',
    lastSpringFrost: '05-01',
    firstFallFrost: '10-15',
  },

  // Default fallback
  default: {
    zone: 'default',
    label: 'Temperate climate (default)',
    lastSpringFrost: '04-30',
    firstFallFrost: '10-15',
  },
};

/**
 * Infer climate zone from user language and approximate latitude
 */
export function inferClimateZone(
  language: string,
  latitude: number | null
): ClimateZone {
  if (latitude !== null) {
    // Northern hemisphere
    if (latitude >= 35 && latitude <= 50) {
      if (language === 'fr') return climateZones['fr-north'];
      if (language === 'es') return climateZones['es'];
      if (language === 'de') return climateZones['de'];
      // Default English-speaking temperate
      if (latitude >= 40 && latitude <= 45) return climateZones['us-midwest'];
      if (latitude > 45) return climateZones['us-northeast'];
      return climateZones['us-southeast'];
    }
    if (latitude > 50) return climateZones['us-northeast']; // Cold temperate
    if (latitude < 35) return climateZones['us-southwest']; // Warm climate
  }

  // Fallback by language
  if (language === 'fr') return climateZones['fr-north'];
  if (language === 'es') return climateZones['es'];
  if (language === 'de') return climateZones['de'];

  return climateZones.default;
}
