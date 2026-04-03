'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * Home page that redirects to dashboard when authenticated,
 * or shows landing page for unauthenticated users.
 */
export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      // Redirect authenticated users to dashboard
      const locale = pathname.split('/')[1] || 'fr';
      router.push(`/${locale}/dashboard`);
    }
  }, [status, session, router, pathname]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--theme-bg-primary, #fff8e7)' }}
      >
        <div className="text-center">
          <div className="font-pixel text-2xl text-ink-800 mb-4">🌿 greenU</div>
          <div className="text-ink-500 font-pixel text-sm">Chargement...</div>
        </div>
      </div>
    );
  }

  // For unauthenticated users, show landing page
  if (!session) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--theme-bg-primary, #fff8e7)' }}
      >
        <div className="text-center">
          <div className="font-pixel text-3xl text-ink-800 mb-4">🌿 greenU</div>
          <div className="text-ink-500 font-body text-sm mb-4">Connexion requise</div>
          <div className="flex gap-4 justify-center">
            <a
              href="/auth/signin"
              className="btn-pixel"
              style={{ background: '#ffcc4d', color: '#302818' }}
            >
              Se connecter
            </a>
            <a href="/auth/signup" className="btn-pixel btn-pixel-primary">
              S&apos;inscrire
            </a>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
