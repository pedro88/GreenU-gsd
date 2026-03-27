import { prisma } from '@/lib/db';

export type GardenPermission = 'owner' | 'editor' | 'viewer' | 'none';

/**
 * Checks the permission level a user has on a specific garden.
 * Queries the database to determine if the user is the owner, has an access record, or has no access.
 * @param userId - The ID of the user to check permissions for (null/undefined for unauthenticated)
 * @param gardenId - The ID of the garden to check access for
 * @returns The user's permission level: 'owner', 'editor', 'viewer', or 'none'
 */
export async function getGardenPermission(
  userId: string | null | undefined,
  gardenId: string
): Promise<GardenPermission> {
  if (!userId) return 'none';

  const garden = await prisma.garden.findFirst({
    where: { id: gardenId },
    select: { userId: true },
  });

  if (!garden) return 'none';

  if (garden.userId === userId) return 'owner';

  const access = await prisma.gardenAccess.findUnique({
    where: { userId_gardenId: { userId, gardenId } },
    select: { role: true },
  });

  if (!access) return 'none';

  return access.role === 'EDITOR' ? 'editor' : 'viewer';
}

/**
 * Checks whether a user has at least read-only access to a garden.
 * Returns true if the user is an owner, editor, or viewer of the garden.
 * @param userId - The ID of the user to check permissions for (null/undefined for unauthenticated)
 * @param gardenId - The ID of the garden to check access for
 * @returns True if the user can read the garden, false otherwise
 */
export async function canReadGarden(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  const perm = await getGardenPermission(userId, gardenId);
  return perm !== 'none';
}

/**
 * Checks whether a user has write access to a garden.
 * Returns true only if the user is an owner or editor (not viewer).
 * @param userId - The ID of the user to check permissions for (null/undefined for unauthenticated)
 * @param gardenId - The ID of the garden to check access for
 * @returns True if the user can write to the garden, false otherwise
 */
export async function canWriteGarden(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  const perm = await getGardenPermission(userId, gardenId);
  return perm === 'owner' || perm === 'editor';
}

/**
 * Checks whether a user is the owner of a specific garden.
 * @param userId - The ID of the user to check (null/undefined for unauthenticated)
 * @param gardenId - The ID of the garden to check ownership for
 * @returns True if the user is the garden owner, false otherwise
 */
export async function isGardenOwner(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  return (await getGardenPermission(userId, gardenId)) === 'owner';
}
