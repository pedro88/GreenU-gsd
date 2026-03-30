import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * Zod schema for settings update validation
 */
const settingsUpdateSchema = z.object({
  // Profile
  displayName: z.string().max(100).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  avatarUrl: z.string().url().optional().nullable(),
  isPublic: z.boolean().optional(),
  
  // Location
  country: z.string().max(100).optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  climateZone: z.string().max(50).optional().nullable(),
  
  // Notifications
  emailHarvest: z.boolean().optional(),
  emailCompanion: z.boolean().optional(),
  emailWeekly: z.boolean().optional(),
  pushStreak: z.boolean().optional(),
  pushAchievement: z.boolean().optional(),
  quietHoursStart: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  quietHoursEnd: z.string().regex(/^\d{2}:\d{2}$/).optional().nullable(),
  
  // Theme
  theme: z.enum(['light', 'dark', 'system']).optional(),
}).partial();

/**
 * GET /api/settings
 * Returns the current user's settings, creating defaults if none exist
 * @returns JSON response with user settings
 */
export async function GET(): Promise<NextResponse> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    
    // Get or create settings
    let settings = await prisma.userSettings.findUnique({
      where: { userId },
    });
    
    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId },
      });
    }
    
    return NextResponse.json(settings);
  } catch (error) {
    console.error('[GET /api/settings]', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/settings
 * Updates the current user's settings
 * @param request - The incoming Next.js request with settings to update
 * @returns JSON response with updated settings
 */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.id;
    const body = await request.json();
    
    // Validate input
    const validationResult = settingsUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid settings data', details: validationResult.error.issues },
        { status: 400 }
      );
    }
    
    const validatedData = validationResult.data;
    
    // Ensure settings exist
    await prisma.userSettings.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
    
    // Update settings
    const updatedSettings = await prisma.userSettings.update({
      where: { userId },
      data: validatedData,
    });
    
    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('[PATCH /api/settings]', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}
