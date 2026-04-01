import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';

/**
 * Redirect /garden to /gardens/[userId]
 */
export default async function GardenRedirect() {
  const session = await auth();
  
  if (session?.user?.id) {
    redirect(`/gardens/${session.user.id}`);
  } else {
    redirect('/auth/signin');
  }
}
