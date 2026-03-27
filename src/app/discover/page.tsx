import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { DiscoverFeed } from '@/components/discover/DiscoverFeed';

/**
 * Discover Feed page — /discover
 * Public page showing all public gardens with search, filter, and follow functionality.
 * Accessible without authentication.
 * @returns The discover page JSX
 */
export default async function DiscoverPage() {
  const session = await auth();

  // Fetch initial gardens (no auth required)
  const initialGardens = await prisma.garden.findMany({
    where: { isPublic: true },
    take: 20,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, image: true } },
      zones: {
        select: {
          id: true,
          name: true,
          type: true,
          _count: { select: { plots: true } },
          plots: {
            select: {
              crops: {
                where: { status: { not: 'HARVESTED' } },
                select: { plantTypeId: true },
              },
            },
          },
        },
      },
    },
  });

  // Get all plant types for filter dropdown
  const allPlantTypes = await prisma.plantType.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  // Batch fetch plant types for initial gardens
  const allPlantTypeIds = Array.from(
    new Set(
      initialGardens.flatMap((g) =>
        g.zones.flatMap((z) => z.plots.flatMap((p) => p.crops.map((c) => c.plantTypeId)))
      )
    )
  );
  const plantTypes = await prisma.plantType.findMany({
    where: { id: { in: allPlantTypeIds } },
    select: { id: true, name: true },
  });
  const plantTypeMap = new Map(plantTypes.map((p) => [p.id, p.name]));

  // Get initial following IDs if logged in
  let initialFollowingIds: string[] = [];
  if (session?.user?.id) {
    const following = await prisma.follow.findMany({
      where: { followerId: session.user.id },
      select: { followingId: true },
    });
    initialFollowingIds = following.map((f) => f.followingId);
  }

  const gardenCards = initialGardens.map((garden) => {
    const topCropNames = Array.from(
      new Set(
        garden.zones.flatMap((z) =>
          z.plots.flatMap((p) =>
            p.crops.map((c) => plantTypeMap.get(c.plantTypeId) as string).filter(Boolean)
          )
        )
      )
    ).slice(0, 5);
    return {
      id: garden.id,
      name: garden.name,
      description: garden.description,
      location: garden.location,
      followerCount: garden.followerCount,
      owner: garden.user,
      zones: garden.zones.map((z) => ({
        id: z.id,
        name: z.name,
        type: z.type,
        plotCount: z._count.plots,
      })),
      topCrops: topCropNames,
      cropCount: topCropNames.length,
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Discover Gardens</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Explore gardens shared by the community
              </p>
            </div>
            {session?.user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  Signed in as{' '}
                  <span className="font-medium text-gray-700">
                    {session.user.name || session.user.email}
                  </span>
                </span>
              </div>
            ) : (
              <a
                href="/auth/signin"
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
              >
                Sign in to follow
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DiscoverFeed
          initialGardens={gardenCards}
          plantTypes={allPlantTypes}
          initialFollowingIds={initialFollowingIds}
        />
      </div>
    </div>
  );
}
