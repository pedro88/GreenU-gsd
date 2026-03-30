import { SignUpForm } from '@/components/auth/SignUpForm';
import { Suspense } from 'react';

/**
 * Sign-up page with retro pixel styling.
 * Uses the greenU component library.
 */
export default function SignUpPage() {
  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12"
      style={{
        backgroundImage: 'radial-gradient(circle, #D4C5A9 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-20 left-8 text-5xl opacity-10 select-none">
        🍅
      </div>
      <div className="absolute top-20 right-8 text-5xl opacity-10 select-none">
        🥕
      </div>

      <Suspense fallback={<div className="font-pixel text-ink-500">LOADING...</div>}>
        <SignUpForm />
      </Suspense>

      {/* Bottom decoration */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-3 opacity-30">
        {['🍅', '🥕', '🌶️', '🥦', '🍆', '🌽', '🫑', '🥬'].map((emoji) => (
          <span key={emoji} className="text-xl">
            {emoji}
          </span>
        ))}
      </div>
    </div>
  );
}
