'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  {
    name: 'Tableau de bord',
    href: '/dashboard',
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    name: 'Mes jardins',
    href: '/gardens/me',
    icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z',
  },
  {
    name: 'Analyses',
    href: '/analytics',
    icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
  },
  {
    name: 'Profil',
    href: '/profile',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
  },
  {
    name: 'Paramètres',
    href: '/settings',
    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
  },
];

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between h-16 px-4 border-b-[3px] border-ink-800"
        style={{ background: '#302818' }}
      >
        <Link href="/dashboard" className="flex items-center space-x-2">
          <span className="text-xl font-bold text-cream-50 font-pixel">greenU</span>
        </Link>

        {/* Close button for mobile */}
        {onClose && (
          <button
            type="button"
            className="md:hidden p-2 text-cream-100 hover:text-terracotta-300"
            style={{ background: 'transparent' }}
            onClick={onClose}
            aria-label="Fermer le menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 px-2 py-4 space-y-1 overflow-y-auto"
        style={{ background: '#3d3020' }}
        aria-label="Navigation principale"
      >
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`
                group flex items-center px-3 py-3 text-sm font-pixel
                border-[3px] transition-all duration-75
                ${
                  isActive
                    ? 'text-cream-50 border-terracotta-500'
                    : 'text-cream-200 border-transparent hover:bg-cream-100/10 hover:text-cream-50'
                }
              `}
              style={
                isActive
                  ? {
                      boxShadow: 'inset -2px -2px 0px 0px rgba(196, 145, 107, 0.3)',
                    }
                  : {}
              }
              aria-current={isActive ? 'page' : undefined}
            >
              <svg
                className={`mr-3 h-5 w-5 flex-shrink-0 ${
                  isActive ? 'text-terracotta-300' : 'text-cream-300 group-hover:text-cream-100'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
              </svg>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t-[3px] border-ink-800" style={{ background: '#302818' }}>
        <div className="text-xs text-cream-300 text-center font-pixel">
          <p>greenU v1.0</p>
          <p className="mt-1">© 2026 Tous droits réservés</p>
        </div>
      </div>
    </div>
  );
}
