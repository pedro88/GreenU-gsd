'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

const features = [
  {
    icon: '🌱',
    title: 'Garden Builder',
    desc: 'Plan your garden with zones, plots, and crop tracking',
  },
  {
    icon: '🔄',
    title: 'Crop Rotation',
    desc: 'Smart rotation suggestions based on plant families',
  },
  { icon: '🌿', title: 'Companion Planting', desc: 'Know which plants grow best together' },
  { icon: '📅', title: 'Smart Calendar', desc: 'Frost dates and planting schedules for your zone' },
  { icon: '📊', title: 'Analytics', desc: 'Track yields, success rates, and season trends' },
  { icon: '🌍', title: 'Discover', desc: 'Browse and follow other gardeners' },
];

/**
 * Retro Sega/SNES-era landing page for greenU.
 * Shows feature grid and sign-in/sign-up for unauthenticated users.
 * @returns The retro home page JSX
 */
export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-20 text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #D4C5A9 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Floating decorative plants */}
        <div className="absolute top-8 left-8 text-5xl animate-float opacity-20">🌻</div>
        <div
          className="absolute top-16 right-12 text-4xl animate-float opacity-20"
          style={{ animationDelay: '1s' }}
        >
          🌵
        </div>
        <div
          className="absolute bottom-12 left-16 text-4xl animate-float opacity-20"
          style={{ animationDelay: '0.5s' }}
        >
          🍀
        </div>

        {/* Title */}
        <div className="relative z-10">
          <div className="inline-block mb-4 pixel-card px-6 py-3">
            <span className="font-pixel text-xs font-bold tracking-widest text-terracotta-700 uppercase">
              🌿 Welcome to
            </span>
          </div>

          <h1 className="pixel-heading-lg text-5xl md:text-6xl mb-4">
            green<span className="text-forest-500">U</span>
          </h1>

          <p className="font-pixel text-sm md:text-base text-ink-600 tracking-wide mb-2 uppercase">
            Cultivation Intelligence Platform
          </p>
          <p className="font-body text-ink-500 max-w-md mx-auto mb-8">
            Plan. Plant. Track. Level up your garden game.
          </p>

          {/* CTA buttons */}
          {session ? (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href={{ pathname: '/garden' }}
                className="btn-pixel btn-pixel-secondary text-sm px-6 py-3"
              >
                &gt; ENTER YOUR GARDEN
              </Link>
              <Link
                href={{ pathname: '/discover' }}
                className="btn-pixel btn-pixel-ghost text-sm px-6 py-3"
              >
                🌍 EXPLORE
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link
                href={{ pathname: '/auth/signup' }}
                className="btn-pixel btn-pixel-primary text-sm px-6 py-3"
              >
                &gt; START YOUR JOURNEY
              </Link>
              <Link
                href={{ pathname: '/auth/signin' }}
                className="btn-pixel btn-pixel-ghost text-sm px-6 py-3"
              >
                SIGN IN
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <div className="pixel-divider" />

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="section-header text-center mb-8">FEATURES</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="pixel-card p-5 hover:scale-[1.02] transition-transform duration-75"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-pixel text-sm font-bold text-ink-800 mb-1 tracking-wide">
                {f.title}
              </h3>
              <p className="font-body text-xs text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="pixel-divider" />

      {/* Bottom stats section */}
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <div className="pixel-card-inset p-6 inline-block">
          <div className="font-pixel text-xs text-ink-500 tracking-widest uppercase mb-3">
            Your Garden Stats
          </div>
          <div className="flex gap-8 justify-center">
            {[
              { label: 'ZONES', value: '???' },
              { label: 'PLOTS', value: '???' },
              { label: 'CROPS', value: '???' },
              { label: 'HARVESTS', value: '???' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-pixel text-xl font-bold text-terracotta-600">{s.value}</div>
                <div className="font-pixel text-[10px] text-ink-400 tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
          {session ? (
            <p className="mt-4 font-pixel text-xs text-ink-500">Sign in to view your stats &gt;</p>
          ) : (
            <Link
              href={{ pathname: '/auth/signup' }}
              className="mt-4 inline-block btn-pixel btn-pixel-sm btn-pixel-ghost"
            >
              JOIN NOW &gt;
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[3px] border-ink-700 mt-8 py-6 px-4 text-center">
        <p className="font-pixel text-[10px] text-ink-400 tracking-widest">
          greenU 🌿 — Level up your garden — v0.1.0
        </p>
      </footer>
    </div>
  );
}
