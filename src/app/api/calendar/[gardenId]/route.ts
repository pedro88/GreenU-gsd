import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { inferClimateZone } from '@/lib/frostDates';
import { plantingCalendarRules } from '@/lib/plantingCalendar';
import { canReadGarden } from '@/lib/gardenAccess';

/**
 * GET /api/calendar/[gardenId]
 * Returns upcoming garden tasks based on the garden's location climate zone and planted crops.
 * Tasks include sowing, transplanting, fertilizing, and harvesting reminders.
 * @param request - The incoming Next.js request object (unused but required by Next.js routing)
 * @param root0 - Destructured route parameters
 * @param root0.params - Promise resolving to route params containing gardenId
 * @returns JSON response with garden tasks, climate zone info, and frost dates, or an error response
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gardenId: string }> }
): Promise<NextResponse> {
  try {
    const { gardenId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const canRead = await canReadGarden(session.user.id, gardenId);
    if (!canRead) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    const garden = await prisma.garden.findFirst({ where: { id: gardenId } });
    if (!garden) {
      return NextResponse.json({ error: 'Garden not found' }, { status: 404 });
    }

    // Get garden owner preferences for location (frost dates are per garden location, not viewer)
    const gardenOwner = await prisma.user.findUnique({
      where: { id: garden.userId },
      select: { language: true, latitude: true, longitude: true },
    });

    const climateZone = inferClimateZone(
      gardenOwner?.language ?? 'en',
      gardenOwner?.latitude ?? null
    );

    // Parse frost dates for current year
    const year = new Date().getFullYear();
    const [springMonth, springDay] = climateZone.lastSpringFrost.split('-').map(Number);
    const [fallMonth, fallDay] = climateZone.firstFallFrost.split('-').map(Number);
    const lastSpringFrost = new Date(year, springMonth - 1, springDay);
    const firstFallFrost = new Date(year, fallMonth - 1, fallDay);

    // Get all active crops with plant types
    const plots = await prisma.plot.findMany({
      where: {
        zone: { gardenId },
      },
      include: {
        zone: { select: { name: true } },
        crops: {
          where: { status: { not: 'HARVESTED' } },
          include: {
            plantType: { select: { id: true, name: true } },
            events: {
              orderBy: { date: 'asc' },
              select: { eventType: true, date: true },
            },
          },
        },
      },
    });

    const tasks: CalendarTask[] = [];

    for (const plot of plots) {
      for (const crop of plot.crops) {
        const plantName = crop.plantType.name;
        const rules = plantingCalendarRules[plantName] ?? [];

        // Calculate task dates based on frost dates
        for (const rule of rules) {
          const taskDate = new Date(lastSpringFrost);
          taskDate.setDate(taskDate.getDate() + rule.weeksFromLastFrost * 7);

          // Skip tasks more than 30 days in the past
          const now = new Date();
          now.setDate(now.getDate() - 30);

          if (taskDate < now) continue;

          // For crops planted mid-season, adjust relative to planted date
          let effectiveDate: Date;
          if (rule.weeksFromLastFrost < 0) {
            // This is a spring task, use frost date
            effectiveDate = taskDate;
          } else {
            // This is a summer/fall task, check if crop was planted
            const sowDate = crop.events.find((e) => e.eventType === 'SOWING')?.date;
            if (sowDate) {
              const sow = new Date(sowDate);
              effectiveDate = new Date(sow);
              effectiveDate.setDate(effectiveDate.getDate() + rule.weeksFromLastFrost * 7);
            } else {
              effectiveDate = taskDate;
            }
          }

          // Clamp fall frost tasks to before first fall frost
          if (rule.type === 'harvest' && rule.weeksFromLastFrost > 20) {
            if (effectiveDate > firstFallFrost) {
              effectiveDate = new Date(firstFallFrost);
            }
          }

          tasks.push({
            id: `${crop.id}-${rule.type}-${rule.weeksFromLastFrost}`,
            date: effectiveDate.toISOString().split('T')[0],
            type: rule.type,
            icon: rule.icon,
            label: getTaskLabel(rule.type, plantName),
            cropId: crop.id,
            cropName: plantName,
            plotName: plot.name,
            zoneName: plot.zone.name,
            gardenId,
            status:
              effectiveDate < now
                ? 'overdue'
                : effectiveDate.toDateString() === now.toDateString()
                  ? 'today'
                  : 'upcoming',
          });
        }
      }
    }

    // Sort by date
    tasks.sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      gardenId,
      gardenName: garden.name,
      climateZone: climateZone.label,
      lastSpringFrost: lastSpringFrost.toISOString().split('T')[0],
      firstFallFrost: firstFallFrost.toISOString().split('T')[0],
      tasks,
    });
  } catch (error) {
    console.error('Failed to fetch calendar:', error);
    return NextResponse.json({ error: 'Failed to fetch calendar' }, { status: 500 });
  }
}

interface CalendarTask {
  id: string;
  date: string;
  type: string;
  icon: string;
  label: string;
  cropId: string;
  cropName: string;
  plotName: string;
  zoneName: string;
  gardenId: string;
  status: 'overdue' | 'today' | 'upcoming';
}

/**
 * Generates a human-readable label for a garden task based on task type and plant name.
 * Maps common task types to action phrases like "Sow {plant} indoors" or "Harvest {plant}".
 * @param type - The task type identifier (e.g., sow_indoors, transplant, harvest)
 * @param plantName - The name of the plant the task applies to
 * @returns A formatted, user-friendly task description string
 */
function getTaskLabel(type: string, plantName: string): string {
  const labels: Record<string, string> = {
    sow_indoors: `Sow ${plantName} indoors`,
    sow_outdoors: `Sow ${plantName}`,
    transplant: `Transplant ${plantName}`,
    harvest: `Harvest ${plantName}`,
    fertilize: `Fertilize ${plantName}`,
  };
  return labels[type] ?? `${type} ${plantName}`;
}
