'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Sign-in page with retro Sega/SNES-era pixel styling.
 * Features chunky borders, warm earth tones, and gaming UI elements.
 * @returns The retro sign-in page JSX
 */
export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const csrfResponse = await fetch('/api/auth/csrf');
      const { csrfToken } = await csrfResponse.json();

      const result = await signIn('credentials', {
        email,
        password,
        csrfToken,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password — check your credentials!');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Connection failed! Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: 'radial-gradient(circle, #D4C5A9 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Decorative corner pixels */}
      <div className="absolute top-4 left-4 text-4xl opacity-20 font-pixel">🌱</div>
      <div className="absolute top-4 right-4 text-4xl opacity-20 font-pixel">🌱</div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="pixel-heading-lg mb-2">PLAYER SIGN IN</h1>
          <p className="font-pixel text-xs text-ink-500 tracking-widest uppercase">
            Enter your credentials to continue
          </p>
        </div>

        {/* Main card */}
        <div className="retro-dialog rounded-lg p-6 space-y-5">
          {/* ASCII-style top border decoration */}
          <div className="font-mono text-xs text-ink-400 tracking-tight overflow-hidden whitespace-nowrap">
            ╔══════════════════════════════════════╗
          </div>

          {/* Error */}
          {error && (
            <div
              className="bg-terracotta-50 border-[2px] border-terracotta-700 px-4 py-2 font-pixel text-xs text-terracotta-800 font-semibold tracking-wide"
              style={{ boxShadow: '2px 2px 0px #CC3310' }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="pixel-label">
                👤 EMAIL
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="pixel-input"
              />
            </div>

            <div>
              <label htmlFor="password" className="pixel-label">
                🔑 PASSWORD
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pixel-input"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pixel btn-pixel-primary w-full text-center"
            >
              {loading ? '▶ CONNECTING...' : '▶ START GAME'}
            </button>
          </form>

          {/* Divider */}
          <div className="pixel-divider" />

          {/* Sign up link */}
          <p className="text-center font-body text-sm text-ink-600">
            No account yet?{' '}
            <Link
              href="/auth/signup"
              className="font-pixel text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-2"
            >
              CREATE CHARACTER →
            </Link>
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-4 flex justify-center gap-2 opacity-40">
          {['🌱', '🌿', '🌾', '🍅', '🥕'].map((emoji) => (
            <span key={emoji} className="text-lg">
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
