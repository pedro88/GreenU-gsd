'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useAppSelector } from '@/lib/hooks';
import { selectStats } from '@/store/slices/dashboardSlice';

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { data: session } = useSession();
  const stats = useAppSelector(selectStats);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const userName = session?.user?.name?.split(' ')[0] || 'Jardinier';
  const userInitial = session?.user?.name?.[0]?.toUpperCase() || userName[0].toUpperCase();

  // Calculate level from XP
  const level = stats?.totalXP ? Math.max(1, Math.floor(Math.sqrt(stats.totalXP / 100))) : 1;

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="pixel-card-inset mb-4" style={{ marginBottom: '16px' }}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Mobile menu button */}
          <div className="flex items-center">
            <button
              type="button"
              className="md:hidden p-2 text-ink-700 hover:text-terracotta-500"
              style={{ background: 'transparent' }}
              onClick={onMenuClick}
              aria-label="Ouvrir le menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="ml-2 md:ml-0">
              <h1
                className="text-xl font-bold text-ink-900 font-pixel tracking-wide"
                style={{ textShadow: '2px 2px 0px #d4c5a9' }}
              >
                greenU
              </h1>
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Search */}
            <div className="hidden sm:block relative">
              <input
                type="search"
                placeholder="Rechercher..."
                className="pixel-input w-48 lg:w-64 pl-10 pr-4 py-2 text-sm"
                style={{
                  minHeight: '36px',
                  fontSize: '13px',
                  paddingLeft: '36px',
                }}
                aria-label="Rechercher"
              />
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* Notifications */}
            <button
              type="button"
              className="relative p-2 text-ink-700 hover:text-terracotta-500 transition-colors"
              style={{ background: 'transparent' }}
              aria-label="Notifications"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              {/* Notification badge */}
              <span
                className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full"
                style={{ background: '#ff5526', boxShadow: '0 0 0 2px #fff8e7' }}
              />
            </button>

            {/* User menu */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 p-1 border-[2px] border-ink-700 hover:border-terracotta-500 transition-colors"
                style={{ background: '#fff8e7' }}
                aria-label="Menu utilisateur"
                aria-expanded={showUserMenu}
              >
                <div
                  className="h-8 w-8 flex items-center justify-center border-[2px] border-ink-800 font-pixel font-bold text-sm"
                  style={{
                    background: '#ff5526',
                    boxShadow: '2px 2px 0px 0px #302818',
                    color: '#fff8e7',
                  }}
                >
                  {userInitial}
                </div>
                <span className="hidden sm:block text-sm font-pixel text-ink-800">{userName}</span>
                {/* Level badge */}
                <span
                  className="hidden sm:flex items-center px-1.5 py-0.5 font-pixel text-xs font-bold border-[2px] border-ink-800"
                  style={{
                    background: '#ffcc4d',
                    color: '#302818',
                    boxShadow: '1px 1px 0px 0px #302818',
                  }}
                >
                  LV{level}
                </span>
                <svg
                  className="hidden sm:block h-4 w-4 text-ink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={showUserMenu ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
                  />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <div
                  className="absolute right-0 top-full mt-2 w-56 pixel-card p-0 z-50"
                  style={{ minWidth: '200px' }}
                >
                  {/* User info header */}
                  <div
                    className="px-4 py-3 border-b-[3px] border-ink-700"
                    style={{ background: '#e8dfd0' }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-pixel text-sm font-bold text-ink-900">
                          {session?.user?.name || 'Jardinier'}
                        </p>
                        <p className="font-body text-xs text-ink-500">{session?.user?.email}</p>
                      </div>
                      <span
                        className="px-2 py-1 font-pixel text-xs font-bold border-[2px] border-ink-800"
                        style={{
                          background: '#ffcc4d',
                          color: '#302818',
                          boxShadow: '2px 2px 0px 0px #302818',
                        }}
                      >
                        LV{level}
                      </span>
                    </div>
                    {/* XP progress */}
                    {stats?.totalXP && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs font-pixel mb-1">
                          <span style={{ color: '#7a6330' }}>{stats.totalXP} XP</span>
                          <span style={{ color: '#9a7b3c' }}>Prochain niveau</span>
                        </div>
                        <div
                          className="h-2 border-[2px] border-ink-700"
                          style={{ background: '#e8dfd0' }}
                        >
                          <div
                            className="h-full transition-all"
                            style={{
                              background: '#4ca64c',
                              width: `${Math.min(100, stats.totalXP % 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>👤</span>
                      <span>Mon profil</span>
                    </Link>
                    <Link
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 font-body text-sm text-ink-800 hover:bg-cream-200 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <span>⚙️</span>
                      <span>Paramètres</span>
                    </Link>
                  </div>

                  <div className="h-[2px]" style={{ background: '#e8dfd0' }} />

                  {/* Sign out */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 font-body text-sm text-terracotta-600 hover:bg-terracotta-50 transition-colors"
                    >
                      <span>🚪</span>
                      <span>Se déconnecter</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
