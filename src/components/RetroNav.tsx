'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';

const navLinks = [
  { href: '/discover', label: 'Discover', icon: '🌍' },
  { href: '/garden', label: 'My Garden', icon: '🌱' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/clients', label: 'Clients', icon: '👥' },
];

/**
 * Retro Sega/SNES-era navigation bar with chunky pixel styling.
 * Shows logo, nav links, and user menu dropdown.
 * @returns The retro navigation bar JSX
 */
export function RetroNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);

  return (
    <nav className="retro-nav sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-pixel font-bold text-terracotta-600 group-hover:text-terracotta-700 tracking-wider transition-colors">
              greenU
            </span>
            <span className="text-lg">🌿</span>
          </Link>

          {/* Desktop nav */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                    href={link.href as any}
                    className={`font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] transition-all ${
                      isActive
                        ? 'border-ink-800 bg-FFCC4D text-ink-900 shadow-pixel-sm'
                        : 'border-transparent text-ink-600 hover:border-ink-400 hover:text-ink-800'
                    }`}
                  >
                    <span className="mr-1">{link.icon}</span>
                    {link.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* User menu */}
          <div className="flex items-center gap-3">
            {session ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="flex items-center gap-2 font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 transition-colors"
                  style={{ boxShadow: '2px 2px 0px #302818' }}
                >
                  <span className="text-sm">👤</span>
                  <span className="hidden sm:inline text-ink-700">
                    {session.user?.name?.split(' ')[0] ?? 'Player'}
                  </span>
                  <span className="text-xs">{showMenu ? '▲' : '▼'}</span>
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 retro-dialog z-50"
                    style={{ boxShadow: '5px 5px 0px #302818' }}
                  >
                    <div className="pixel-divider" />
                    <Link
                      href="/profile"
                      className="block px-4 py-2 font-pixel text-xs font-semibold text-ink-700 hover:bg-cream-200 transition-colors"
                      onClick={() => setShowMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <div className="pixel-divider" />
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        signOut();
                      }}
                      className="w-full text-left px-4 py-2 font-pixel text-xs font-semibold text-terracotta-700 hover:bg-cream-200 transition-colors"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/signin"
                  className="font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-50 hover:bg-cream-100 transition-colors"
                  style={{ boxShadow: '2px 2px 0px #302818' }}
                >
                  SIGN IN
                </Link>
                <Link
                  href="/auth/signup"
                  className="font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-terracotta-700 bg-terracotta-500 text-cream-50 hover:bg-terracotta-600 transition-colors"
                  style={{ boxShadow: '2px 2px 0px #5C2D1A' }}
                >
                  SIGN UP
                </Link>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden font-pixel text-sm border-[2px] border-ink-700 px-2 py-1 bg-cream-50"
              style={{ boxShadow: '2px 2px 0px #302818' }}
              onClick={() => setShowMobile(!showMobile)}
            >
              {showMobile ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {showMobile && session && (
          <div className="md:hidden border-t-[2px] border-ink-400 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                  href={link.href as any}
                  className={`flex items-center gap-2 font-pixel text-xs font-semibold px-4 py-2 border-[2px] ${
                    isActive
                      ? 'border-ink-800 bg-FFCC4D text-ink-900'
                      : 'border-transparent text-ink-600 hover:border-ink-400'
                  }`}
                  onClick={() => setShowMobile(false)}
                >
                  <span>{link.icon}</span> {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
