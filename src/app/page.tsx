'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator, SeparatorWithDots } from '@/components/ui/Separator';

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
 * Landing page for greenU with retro pixel styling.
 * Shows feature grid and sign-in/sign-up for unauthenticated users.
 * Uses the greenU component library.
 */
export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section
        className="relative overflow-hidden px-4 py-20 text-center"
        style={{
          backgroundImage: 'radial-gradient(circle, #D4C5A9 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      >
        {/* Floating decorative plants */}
        <div className="absolute top-8 left-8 text-5xl animate-float opacity-20 select-none pointer-events-none">🌻</div>
        <div
          className="absolute top-16 right-12 text-4xl animate-float opacity-20 select-none pointer-events-none"
          style={{ animationDelay: '1s' }}
        >
          🌵
        </div>
        <div
          className="absolute bottom-12 left-16 text-4xl animate-float opacity-20 select-none pointer-events-none"
          style={{ animationDelay: '0.5s' }}
        >
          🍀
        </div>

        {/* Title */}
        <div className="relative z-10 max-w-2xl mx-auto">
          <Badge variant="warning" className="inline-block mb-4">
            🌿 Welcome to
          </Badge>

          <h1 className="font-pixel text-4xl md:text-6xl font-bold text-ink-900 tracking-wide mb-4">
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
              <Button variant="secondary" size="lg" asChild>
                <Link href="/garden">▶ ENTER YOUR GARDEN</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/discover">🌍 EXPLORE</Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Button variant="primary" size="lg" asChild>
                <Link href="/auth/signup">▶ START YOUR JOURNEY</Link>
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <Link href="/auth/signin">SIGN IN</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Divider */}
      <SeparatorWithDots className="max-w-5xl mx-auto px-4" />

      {/* Feature grid */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="font-pixel text-lg font-bold text-ink-800 text-center mb-8 tracking-wider">
          ✦ FEATURES ✦
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <Card
              key={f.title}
              className="p-5 hover:-translate-y-1 transition-transform duration-75"
            >
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-pixel text-sm font-bold text-ink-800 mb-1 tracking-wide">
                {f.title}
              </h3>
              <p className="font-body text-xs text-ink-500 leading-relaxed">{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Divider */}
      <SeparatorWithDots className="max-w-5xl mx-auto px-4" />

      {/* Bottom stats section */}
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Card variant="default" className="max-w-lg mx-auto p-6">
          <div className="font-pixel text-xs text-ink-500 tracking-widest uppercase mb-3">
            Your Garden Stats
          </div>
          <div className="flex gap-8 justify-center flex-wrap">
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
            <Button variant="ghost" size="sm" className="mt-4" asChild>
              <Link href="/auth/signup">JOIN NOW &gt;</Link>
            </Button>
          )}
        </Card>
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
