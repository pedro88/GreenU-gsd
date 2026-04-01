import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { GardenHubContent } from './GardenHubContent';

/**
 * User's Gardens Page — /gardens/[userID]
 * Shows all gardens for a user with ability to create new ones.
 * If user visits their own page, redirects to /gardens/me
 */
export default async function UserGardensPage({ 
  params 
}: { 
  params: Promise<{ userID: string }> 
}) {
  const session = await auth();
  const { userID } = await params;

  // If userID is 'me', redirect to their actual user ID
  if (userID === 'me') {
    if (session?.user?.id) {
      redirect(`/gardens/${session.user.id}`);
    } else {
      redirect('/auth/signin');
    }
  }

  // Check if this is the current user
  const isOwnPage = session?.user?.id === userID;

  // Fetch user's gardens (owner + collaborator)
  const gardens = await prisma.garden.findMany({
    where: {
      OR: [
        { userId: userID },
        { collaborators: { some: { userId: userID } } },
      ],
    },
    select: {
      id: true,
      name: true,
      description: true,
      isPublic: true,
      userId: true,
      _count: {
        select: {
          zones: true,
        },
      },
      zones: {
        select: {
          _count: {
            select: { plots: true },
          },
        },
      },
      collaborators: {
        where: { userId: userID },
        select: { role: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!isOwnPage && gardens.length === 0 && session?.user?.id !== userID) {
    redirect('/discover');
  }

  const user = await prisma.user.findUnique({
    where: { id: userID },
    select: { name: true, image: true },
  });

  return (
    <GardenHubContent 
      gardens={gardens.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        isPublic: g.isPublic,
        userRole: g.userId === userID ? 'OWNER' : (g.collaborators[0]?.role || 'COLLABORATOR'),
        stats: {
          zoneCount: g._count.zones,
          plotCount: g.zones.reduce((acc, z) => acc + z._count.plots, 0),
          activeCropCount: 0,
          gardenerCount: 0,
          followerCount: 0,
          todoCount: 0,
        },
      }))}
      isOwnPage={isOwnPage}
      username={user?.name || 'Gardener'}
    />
  );
}
