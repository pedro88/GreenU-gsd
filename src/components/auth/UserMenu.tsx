'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

/**
 * User menu dropdown component showing avatar, name, and navigation links.
 * Displays sign-in button for unauthenticated users.
 * @returns The user menu dropdown JSX
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
      <Link
        href="/auth/signin"
        className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
      >
        Sign in
      </Link>
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
        className="flex items-center gap-2 rounded-full bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-xs">
          {initials}
        </span>
        <span className="hidden md:inline">{session.user.name || 'User'}</span>
        <svg
          className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="border-b border-gray-100 px-4 py-2">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="truncate text-xs text-gray-500">{session.user.email}</p>
          </div>

          <Link
            href="/discover"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            🔍 Discover
          </Link>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            My Gardens
          </Link>

          <Link
            href="/messages"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            💬 Messages
          </Link>

          <Link
            href="/clients"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            onClick={() => setIsOpen(false)}
          >
            👥 Clients
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
