import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AnalyticsPageClient } from './AnalyticsPageClient';

/**
 * Analytics Dashboard — /analytics/[gardenId]
 * Protected route showing garden performance metrics.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing gardenId
 * @returns The analytics page JSX
 */
export default async function AnalyticsPage({ params }: { params: Promise<{ gardenId: string }> }) {
  return (
    <ProtectedRoute>
      <AnalyticsPageInner params={params} />
    </ProtectedRoute>
  );
}

/**
 * Inner analytics page component that handles auth and data fetching
 * @param root0 - Destructured params object
 * @param root0.params - Route parameters containing gardenId
 * @returns The analytics page client component
 */
async function AnalyticsPageInner({ params }: { params: Promise<{ gardenId: string }> }) {
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

  return <AnalyticsPageClient gardenId={garden.id} gardenName={garden.name} />;
}
