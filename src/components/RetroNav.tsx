'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

interface GameStats {
  level: number;
  currentStreak: number;
}

const navLinks = [
  { href: '/discover', label: 'Discover', icon: '🌍' },
  { href: '/garden', label: 'My Garden', icon: '🌱' },
  { href: '/articles', label: 'Articles', icon: '📖' },
  { href: '/calendar', label: 'Calendar', icon: '📅' },
  { href: '/messages', label: 'Messages', icon: '💬' },
  { href: '/clients', label: 'Clients', icon: '👥' },
];

/**
 * Retro Sega/SNES-era navigation bar with chunky pixel styling.
 * Shows logo, nav links, level badge, and user menu dropdown.
 * Uses the greenU component library.
 */
export function RetroNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);

  // Fetch game stats when session is available
  useEffect(() => {
    if (!session?.user) {
      setGameStats(null);
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await fetch('/api/profile/game-stats');
        if (res.ok) {
          const data = await res.json();
          setGameStats({ level: data.level, currentStreak: data.currentStreak });
        }
      } catch {
        // silently fail — gamification is optional
      }
    };

    fetchStats();
  }, [session]);

  return (
    <nav className="sticky top-0 z-50 bg-cream-50 border-b-[3px] border-ink-700 shadow-[0_4px_0px_0px_#302818]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-pixel font-bold text-xl text-terracotta-600 group-hover:text-terracotta-700 tracking-wider transition-colors">
              greenU
            </span>
            <span className="text-xl">🌿</span>
          </Link>

          {/* Desktop nav */}
          {session && (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] transition-all duration-75 ${
                      isActive
                        ? 'border-ink-800 bg-cream-500 text-ink-900 shadow-[2px_2px_0px_0px_#302818]'
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
                  className="flex items-center gap-2 font-pixel text-xs font-semibold px-3 py-1.5 border-[2px] border-ink-700 bg-cream-100 hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#302818] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-75"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px]">
                      {session.user?.name?.[0]?.toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-ink-700">
                    {session.user?.name?.split(' ')[0] ?? 'Player'}
                  </span>
                  {/* Level badge */}
                  {gameStats && (
                    <Badge variant="warning" size="sm" className="hidden sm:inline-flex">
                      LV{gameStats.level}
                    </Badge>
                  )}
                  <span className="text-xs text-ink-600">{showMenu ? '▲' : '▼'}</span>
                </button>

                {showMenu && (
                  <Card className="absolute right-0 top-full mt-2 w-56 p-0 overflow-hidden">
                    <CardContent className="p-0">
                      {/* Game stats header */}
                      {gameStats && (
                        <>
                          <div className="px-4 py-3 bg-ink-100 border-b-[2px] border-ink-700 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">🔥</span>
                              <span className="font-pixel text-xs text-ink-600">
                                {gameStats.currentStreak} day streak
                              </span>
                            </div>
                            <Badge variant="warning">
                              LV{gameStats.level}
                            </Badge>
                          </div>
                          <div className="h-[2px] bg-ink-200" />
                        </>
                      )}

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <span>👤</span>
                          <span>Profile</span>
                        </Link>
                        <Link
                          href="/settings"
                          className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                          onClick={() => setShowMenu(false)}
                        >
                          <span>⚙️</span>
                          <span>Settings</span>
                        </Link>
                      </div>

                      <div className="h-[2px] bg-ink-200 mx-2" />

                      {/* Sign out */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowMenu(false);
                            signOut();
                          }}
                          className="flex items-center gap-2 w-full px-4 py-2 font-body text-sm text-terracotta-600 hover:bg-terracotta-50 transition-colors"
                        >
                          <span>🚪</span>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">SIGN IN</Link>
                </Button>
                <Button variant="primary" size="sm" asChild>
                  <Link href="/auth/signup">SIGN UP</Link>
                </Button>
              </div>
            )}

            {/* Mobile toggle */}
            <button
              className="md:hidden font-pixel text-sm border-[2px] border-ink-700 px-2 py-1 bg-cream-100 shadow-[2px_2px_0px_0px_#302818] hover:-translate-x-[1px] hover:-translate-y-[1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-75"
              onClick={() => setShowMobile(!showMobile)}
            >
              {showMobile ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile nav */}
        {showMobile && session && (
          <div className="md:hidden border-t-[2px] border-ink-300 py-3 space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 font-pixel text-xs font-semibold px-4 py-2 border-[2px] ${
                    isActive
                      ? 'border-ink-800 bg-cream-500 text-ink-900'
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
