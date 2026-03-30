'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { DangerAlert } from '@/components/ui/Alert';
import { Card, CardContent } from '@/components/ui/Card';

/**
 * Sign-up form component with name, email, password, and confirm password fields.
 * Uses the greenU retro pixel UI components.
 */
export function SignUpForm() {
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

  // Password strength calculation
  const getPasswordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(password)) strength += 25;
    return strength;
  };

  const strength = getPasswordStrength();

  return (
    <Card className="w-full max-w-md">
      <CardContent className="space-y-6 p-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="font-pixel text-xl font-bold text-ink-900 tracking-wide">
            NEW CHARACTER
          </h2>
          <p className="mt-1 font-pixel text-xs text-ink-500 tracking-widest uppercase">
            Create your gardener profile
          </p>
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
            label="👤 PLAYER NAME"
            type="text"
            autoComplete="name"
            placeholder="Master Gardener"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="📧 EMAIL"
            type="email"
            autoComplete="email"
            placeholder="gardener@greenU.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-2">
            <Input
              label="🔑 PASSWORD"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            {password.length > 0 && (
              <Progress
                value={strength}
                className="h-2"
              />
            )}
            <div className="flex justify-between font-pixel text-[10px] text-ink-500">
              <span>PWR:</span>
              <span className={strength >= 75 ? 'text-forest-500' : strength >= 50 ? 'text-cream-600' : 'text-terracotta-500'}>
                {strength >= 75 ? 'STRONG' : strength >= 50 ? 'MEDIUM' : 'WEAK'}
              </span>
            </div>
          </div>

          <Input
            label="🔑 CONFIRM PASSWORD"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {/* Stats decoration */}
          <div className="rounded border-[2px] border-ink-300 bg-ink-100 p-3 shadow-[inset_2px_2px_0px_0px_#5C4B26,inset_-1px_-1px_0px_0px_#B09158]">
            <div className="font-mono text-xs text-ink-600 space-y-1">
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
          </div>

          <Button
            type="submit"
            variant="secondary"
            className="w-full"
            loading={loading}
          >
            ▶ CREATE CHARACTER
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-[2px] bg-ink-200" />
          <span className="font-pixel text-xs text-ink-400">✦</span>
          <div className="flex-1 h-[2px] bg-ink-200" />
        </div>

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
      </CardContent>
    </Card>
  );
}
