import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { CalendarPageClient } from './CalendarPageClient';

/**
 * Smart Planting Calendar — /calendar/[gardenId]
 * Protected route showing garden tasks based on user's location and frost dates.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing gardenId
 * @returns The calendar page JSX
 */
export default async function CalendarPage({ params }: { params: Promise<{ gardenId: string }> }) {
  return (
    <ProtectedRoute>
      <CalendarPageInner params={params} />
    </ProtectedRoute>
  );
}

/**
 * Inner calendar page component that handles auth and data fetching.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing gardenId
 * @returns The calendar page client component JSX
 */
async function CalendarPageInner({ params }: { params: Promise<{ gardenId: string }> }) {
  const session = await auth();
  const { gardenId } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  const garden = await prisma.garden.findFirst({
    where: { id: gardenId, userId: session.user.id },
    select: { id: true, name: true },
  });

  if (!garden) {
    redirect('/profile');
  }

  return <CalendarPageClient gardenId={garden.id} gardenName={garden.name} />;
}
