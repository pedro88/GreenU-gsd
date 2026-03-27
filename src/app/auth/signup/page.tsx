'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

/**
 * Sign-up page with retro Sega/SNES-era pixel styling.
 * Features chunky borders, warm earth tones, and gaming UI elements.
 * @returns The retro sign-up page JSX
 */
export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters!');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed!');
        return;
      }

      router.push('/auth/signin?registered=true');
    } catch {
      setError('Connection error! Try again.');
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
      {/* Decorative */}
      <div className="absolute top-4 left-4 text-4xl opacity-20 font-pixel">🌱</div>
      <div className="absolute top-4 right-4 text-4xl opacity-20 font-pixel">🌱</div>

      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="pixel-heading-lg mb-2">NEW CHARACTER</h1>
          <p className="font-pixel text-xs text-ink-500 tracking-widest uppercase">
            Create your gardener profile
          </p>
        </div>

        {/* Main card */}
        <div className="retro-dialog rounded-lg p-6 space-y-5">
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
              <label htmlFor="name" className="pixel-label">
                👤 PLAYER NAME
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Master Gardener"
                className="pixel-input"
              />
            </div>

            <div>
              <label htmlFor="email" className="pixel-label">
                📧 EMAIL ADDRESS
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="gardener@greenU.com"
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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="pixel-input"
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="pixel-label">
                🔑 CONFIRM PASSWORD
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="pixel-input"
              />
            </div>

            {/* Stats display decoration */}
            <div className="pixel-card-inset rounded p-3 font-mono text-xs text-ink-600 space-y-1">
              <div className="flex justify-between">
                <span>STR:</span>
                <span className="text-forest-600 font-bold">████████░░</span>
              </div>
              <div className="flex justify-between">
                <span>HP:</span>
                <span className="text-terracotta-600 font-bold">██████████</span>
              </div>
              <div className="flex justify-between">
                <span>XP:</span>
                <span className="text-cream-600 font-bold">░░░░░░░░░░</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-pixel btn-pixel-secondary w-full text-center"
            >
              {loading ? '▶ CREATING...' : '▶ CREATE CHARACTER'}
            </button>
          </form>

          {/* Divider */}
          <div className="pixel-divider" />

          {/* Sign in link */}
          <p className="text-center font-body text-sm text-ink-600">
            Already playing?{' '}
            <Link
              href="/auth/signin"
              className="font-pixel text-xs font-semibold text-terracotta-600 hover:text-terracotta-700 underline underline-offset-2"
            >
              SIGN IN →
            </Link>
          </p>
        </div>

        {/* Bottom decoration */}
        <div className="mt-4 flex justify-center gap-2 opacity-40">
          {['🍅', '🥕', '🌶️', '🥦', '🍆'].map((emoji) => (
            <span key={emoji} className="text-lg">
              {emoji}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
