import { PublicGardenPageClient } from './PublicGardenPageClient';

/**
 * Public Garden Page — /gardens/[id]
 * Accessible without authentication.
 * Shows read-only garden view with follow button.
 */
export default async function PublicGardenPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PublicGardenPageClient gardenId={id} />;
}
