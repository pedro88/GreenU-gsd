import type { Metadata } from 'next';
import { SessionProvider } from '@/components/auth/SessionProvider';
import { StoreProvider } from '@/lib/store-provider';
import { RetroNav } from '@/components/RetroNav';
import { ThemeManager } from '@/components/ThemeManager';
import './globals.css';

export const metadata: Metadata = {
  title: 'greenU 🌿 — Cultivation Intelligence',
  description: 'A cultivation intelligence platform for gardeners',
};

/**
 * Root layout with retro Sega/SNES-era navigation bar and providers.
 * @param root0 - Props object
 * @param root0.children - The page content to render
 * @returns The root HTML layout JSX
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23FFF8E7'/><text y='26' font-size='26'>🌿</text></svg>"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Prevent flash of wrong theme
                const theme = localStorage.getItem('greenu-theme');
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen">
        <SessionProvider>
          <StoreProvider>
            <ThemeManager />
            <RetroNav />
            <main>{children}</main>
          </StoreProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
