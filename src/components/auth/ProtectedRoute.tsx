'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

/**
 * A route wrapper that redirects unauthenticated users to the sign-in page
 * and optionally restricts access to users with specific roles.
 * @param root0 - destructured props object
 * @param root0.children - The child elements to render if authenticated
 * @param root0.allowedRoles - Optional array of role names to restrict access
 * @returns The children if authenticated, or null/unauthenticated state otherwise
 */
export function ProtectedRoute({
  children,
  allowedRoles: _allowedRoles = [],
}: ProtectedRouteProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`);
    }
  }, [status, router, pathname]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <>{children}</>;
}
