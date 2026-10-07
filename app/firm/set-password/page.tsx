'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [checking, setChecking] = useState(true);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function check() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/firm/login');
        return;
      }

      setChecking(false);
    }
    check();
  }, [router, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push('/firm/dashboard');
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
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
            Welcome to Praxis.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
            Set a password to secure your account. You will use your email and
            this password to sign in from now on.
          </p>
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
            <span className="text-lg font-semibold text-zinc-950">
              Praxis for Firms
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Set your password
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Choose a password you will remember. At least 8 characters.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-zinc-700"
              >
                New password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block text-sm font-medium text-zinc-700"
              >
                Confirm password
              </label>
              <input
                id="confirm"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900"
                placeholder="Re-enter your password"
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
              {loading ? 'Saving...' : 'Save password and continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}