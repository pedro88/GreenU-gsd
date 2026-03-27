import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AnalyticsPageClient } from './AnalyticsPageClient';

/**
 * Analytics Dashboard — /analytics/[gardenId]
 * Protected route showing garden performance metrics
 */
export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ gardenId: string }>;
}) {
  return (
    <ProtectedRoute>
      <AnalyticsPageInner params={params} />
    </ProtectedRoute>
  );
}

async function AnalyticsPageInner({
  params,
}: {
  params: Promise<{ gardenId: string }>;
}) {
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
