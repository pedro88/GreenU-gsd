'use client';

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '@/store';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { useSession } from 'next-auth/react';

/**
 * Internal component that syncs the Redux auth state with the NextAuth session.
 * Dispatches setUser when authenticated, clearUser when signed out.
 * @returns null (renders nothing)
 */
function AuthSync(): null {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'authenticated' && session?.user) {
      store.dispatch(
        setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          image: session.user.image,
        })
      );
    } else {
      store.dispatch(clearUser());
    }
  }, [session, status]);

  return null;
}

/**
 * Redux Provider wrapper that also syncs authentication state with the Redux store.
 * @param root0 - destructured props object
 * @param root0.children - Child components that need access to the Redux store
 * @returns The Redux Provider with auth synchronization enabled
 */
export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthSync />
      {children}
    </Provider>
  );
}
