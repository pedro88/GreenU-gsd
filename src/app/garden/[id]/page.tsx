import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getGardenPermission } from '@/lib/gardenAccess';
import { GardenPageClient } from './GardenPageClient';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

/**
 * Server component that renders the garden page with authentication and permission checks.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing the garden ID
 * @returns The protected garden page with client component
 */
export default async function GardenPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <ProtectedRoute>
      <GardenPageInner params={params} />
    </ProtectedRoute>
  );
}

/**
 * Inner server component that fetches garden metadata and plant types,
 * then renders the client garden page component.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing the garden ID
 * @returns The garden page client component JSX
 */
async function GardenPageInner({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Check permission — owner OR collaborator
  const permission = await getGardenPermission(session.user.id, id);
  if (permission === 'none') {
    redirect('/profile');
  }

  // Fetch garden metadata and plant list server-side
  const [garden, plants] = await Promise.all([
    prisma.garden.findFirst({
      where: { id },
      select: { id: true, name: true, isPublic: true },
    }),
    prisma.plantType.findMany({
      select: { id: true, name: true, family: { select: { name: true } } },
      orderBy: { name: 'asc' },
    }),
  ]);

  if (!garden) {
    redirect('/profile');
  }

  return (
    <GardenPageClient
      gardenId={garden.id}
      gardenName={garden.name}
      isPublic={garden.isPublic}
      role={permission}
      plants={plants.map((p) => ({ id: p.id, name: p.name, family: p.family.name }))}
    />
  );
}
