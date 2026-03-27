import { PublicGardenPageClient } from './PublicGardenPageClient';

/**
 * Public Garden Page — /gardens/[id]
 * Accessible without authentication. Shows read-only garden view with follow button.
 * @param root0 - Props object
 * @param root0.params - Route parameters containing gardenId
 * @returns The public garden page JSX
 */
export default async function PublicGardenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PublicGardenPageClient gardenId={id} />;
}
