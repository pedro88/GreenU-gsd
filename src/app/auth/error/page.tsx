'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Renders the error message content extracted from the URL search params.
 * @returns The authentication error content JSX
 */
function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    CredentialsSignin: 'Invalid email or password',
    default: 'An authentication error occurred',
  };

  const message = errorMessages[error || 'default'] || errorMessages.default;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Authentication Error</h1>
          <p className="mt-2 text-gray-600">{message}</p>
        </div>

        <Link
          href="/auth/signin"
          className="inline-block rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
        >
          Try again
        </Link>
      </div>
    </div>
  );
}

/**
 * Authentication error page shown when NextAuth encounters an error during sign-in.
 * Displays a user-friendly message based on the error type from the URL.
 * @returns The authentication error page JSX
 */
export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
