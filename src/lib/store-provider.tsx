'use client';

import { Provider } from 'react-redux';
import { useEffect } from 'react';
import { store } from '@/store';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { useSession } from 'next-auth/react';

function AuthSync() {
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

export function StoreProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthSync />
      {children}
    </Provider>
  );
}
