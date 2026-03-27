import type { Metadata } from 'next';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { StoreProvider } from '@/lib/store-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'greenU - Cultivation Intelligence',
  description: 'A cultivation intelligence platform for gardeners',
};

/**
 * Root layout component wrapping the entire application with session and store providers.
 * @param root0 - Props object
 * @param root0.children - The page content to render
 * @returns The root HTML layout JSX
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white dark:bg-gray-900">
        <SessionProvider>
          <StoreProvider>{children}</StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
