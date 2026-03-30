'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DangerAlert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * Sign-in form component with email/password fields.
 * Uses the greenU retro pixel UI components.
 */
export function SignInForm() {
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
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-pixel text-xl font-bold text-ink-900 tracking-wide">
            PLAYER SIGN IN
          </h2>
          <p className="mt-1 font-pixel text-xs text-ink-500 tracking-widest uppercase">
            Enter your credentials
          </p>
        </div>

        {/* ASCII decoration */}
        <div className="font-mono text-xs text-ink-300 tracking-tight text-center">
          ╔══════════════════════════════╗
        </div>

        {/* Error */}
        {error && (
          <DangerAlert>
            <span className="font-pixel text-xs font-semibold tracking-wide">
              ⚠ {error}
            </span>
          </DangerAlert>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="📧 EMAIL"
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="🔑 PASSWORD"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
          >
            ▶ START GAME
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[2px] bg-ink-200" />
          <span className="font-pixel text-xs text-ink-400">✦</span>
          <div className="flex-1 h-[2px] bg-ink-200" />
        </div>

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
      </CardContent>
    </Card>
  );
}
