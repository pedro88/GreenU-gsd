import type { Metadata } from 'next';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { StoreProvider } from '@/lib/store-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'greenU - Cultivation Intelligence',
  description: 'A cultivation intelligence platform for gardeners',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
