'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function FirmLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    supabase.auth
      .signInWithPassword({
        email: email,
        password: password,
      })
      .then((res) => {
        if (res.error) {
          setError(res.error.message);
          setLoading(false);
          return;
        }

        router.push('/firm/dashboard');
        router.refresh();
      });
  }

  return (
    <div className="flex min-h-screen bg-white">
      <div
        className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex"
        style={{ backgroundColor: ODPC_BLUE }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                stroke={ODPC_BLUE}
                strokeWidth="2"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-white">Praxis for Firms</span>
        </div>

        <div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            One login. Every client.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
            Your clients' registrations, renewals, data subject requests,
            breaches, and privacy notices. All in one place.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-8 border-t border-blue-800 pt-8">
            <div>
              <p className="text-2xl font-semibold text-white">Multi-sector</p>
              <p className="mt-1 text-sm text-blue-200">
                All 17 ODPC-regulated activities
              </p>
            </div>
            <div>
              <p className="text-2xl font-semibold text-white">72 hours</p>
              <p className="mt-1 text-sm text-blue-200">
                ODPC breach notification, tracked automatically
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-200">Praxis</p>
      </div>

      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-lg"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold text-zinc-950">Praxis for Firms</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Access your firm's client dashboard.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900"
                placeholder="jane@firm.co.ke"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900"
                placeholder="Enter your password"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link
              href="/firm/signup"
              className="font-medium underline-offset-4 hover:underline"
              style={{ color: ODPC_BLUE }}
            >
              Register your firm
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}