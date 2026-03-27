'use client';

import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-green-600 mb-4">greenU</h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Cultivation Intelligence Platform
        </p>
        {session ? (
          <div className="space-y-4">
            <p className="text-lg text-gray-600">
              Welcome, {session.user?.name || session.user?.email}
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              My Gardens
            </Link>
            <Link
              href="/discover"
              className="inline-block px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
            >
              🔍 Browse Discover
            </Link>
          </div>
        ) : (
          <div className="flex gap-4 justify-center">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="px-6 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
