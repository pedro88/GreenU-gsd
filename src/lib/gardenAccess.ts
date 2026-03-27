import { prisma } from '@/lib/db';

export type GardenPermission = 'owner' | 'editor' | 'viewer' | 'none';

/**
 * Check what permission a user has on a garden.
 * Returns: 'owner' | 'editor' | 'viewer' | 'none'
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
 * Check if user can read a garden (owner, editor, or viewer)
 */
export async function canReadGarden(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  const perm = await getGardenPermission(userId, gardenId);
  return perm !== 'none';
}

/**
 * Check if user can write to a garden (owner or editor only)
 */
export async function canWriteGarden(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  const perm = await getGardenPermission(userId, gardenId);
  return perm === 'owner' || perm === 'editor';
}

/**
 * Check if user is garden owner
 */
export async function isGardenOwner(
  userId: string | null | undefined,
  gardenId: string
): Promise<boolean> {
  return (await getGardenPermission(userId, gardenId)) === 'owner';
}
