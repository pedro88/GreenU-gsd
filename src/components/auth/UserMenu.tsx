'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * User menu dropdown component showing avatar, name, and navigation links.
 * Displays sign-in button for unauthenticated users.
 * Uses the greenU retro pixel UI components.
 */
export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /**
     * Closes the dropdown when the user clicks outside the menu.
     * @param event - The mouse event from the click
     */
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!session?.user) {
    return (
      <Button variant="primary" size="sm" asChild>
        <Link href="/auth/signin">SIGN IN</Link>
      </Button>
    );
  }

  const initials =
    session.user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) ||
    session.user.email?.[0].toUpperCase() ||
    '?';

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-cream-100 border-[2px] border-ink-700 shadow-[2px_2px_0px_0px_#302818] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#302818] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all duration-75"
      >
        <Avatar className="h-7 w-7">
          {session.user.image && <AvatarImage src={session.user.image} alt={session.user.name || ''} />}
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>
        <span className="hidden md:inline font-pixel text-xs font-semibold text-ink-800">
          {session.user.name || 'Player'}
        </span>
        <svg
          className={`h-4 w-4 text-ink-700 transition-transform duration-75 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={3}
        >
          <path strokeLinecap="square" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <Card className="absolute right-0 z-50 mt-2 w-56 p-0 overflow-hidden">
          <CardContent className="p-0">
            {/* User info header */}
            <div className="px-4 py-3 bg-ink-100 border-b-[2px] border-ink-700">
              <p className="font-pixel text-sm font-bold text-ink-900 truncate">
                {session.user.name || 'Player'}
              </p>
              <p className="font-body text-xs text-ink-600 truncate mt-0.5">
                {session.user.email}
              </p>
            </div>

            {/* Menu items */}
            <div className="py-1">
              <Link
                href="/discover"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>🔍</span>
                <span>Discover</span>
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>🌱</span>
                <span>My Gardens</span>
              </Link>

              <Link
                href="/messages"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>💬</span>
                <span>Messages</span>
              </Link>

              <Link
                href="/clients"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>👥</span>
                <span>Clients</span>
              </Link>

              <Link
                href="/settings"
                className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <span>⚙️</span>
                <span>Settings</span>
              </Link>
            </div>

            {/* Divider */}
            <div className="h-[2px] bg-ink-200 mx-2" />

            {/* Sign out */}
            <div className="py-1">
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="flex items-center gap-2 w-full px-4 py-2 font-body text-sm text-terracotta-600 hover:bg-terracotta-50 transition-colors"
              >
                <span>🚪</span>
                <span>Sign out</span>
              </button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
