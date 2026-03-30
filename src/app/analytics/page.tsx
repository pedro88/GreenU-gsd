'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

/**
 * Redirects to analytics for the user's first garden.
 */
export default function AnalyticsPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      router.replace('/auth/signin');
      return;
    }

    // /analytics needs a gardenId — redirect to gardens to pick one
    router.replace('/gardens');
  }, [status, router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="font-pixel text-sm text-ink-500 animate-pulse">Redirecting...</div>
    </div>
  );
}
