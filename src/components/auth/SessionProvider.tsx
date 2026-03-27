'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Session provider wrapper that integrates NextAuth session management into the app.
 * @param root0 - Props object
 * @param root0.children - Child components that will have access to the session context
 * @returns The wrapped children with session provider context
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>;
}
