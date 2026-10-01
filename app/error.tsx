'use client';

import { useEffect } from 'react';
import Link from 'next/link';

const ODPC_BLUE = '#0A3D62';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.error('Praxis error:', error);
    }
  }, [error]);

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="mx-auto flex max-w-md flex-col items-center justify-center px-6 py-16 text-center">
        {/* Praxis logo */}
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl"
          style={{ backgroundColor: ODPC_BLUE }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
              stroke="white"
              strokeWidth="2"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        </div>

        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-zinc-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Praxis ran into an unexpected problem while loading this page. This is
          usually temporary. Try again in a moment.
        </p>

        {/* Action buttons */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4v6h6M20 20v-6h-6M20 9A8 8 0 006.3 5.3L4 8M4 15a8 8 0 0013.7 3.7L20 16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-5 py-2.5 text-sm font-medium transition hover:bg-zinc-100"
            style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
          >
            Go to dashboard
          </Link>
        </div>

        {/* Support note */}
        <div className="mt-10 w-full rounded-xl border border-zinc-200 bg-white p-5 text-left">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Still not working?
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            Contact Praxis support and quote the reference below.
          </p>
          <a
            href="mailto:support@praxis.co.ke"
            className="mt-3 block text-sm font-medium underline-offset-4 hover:underline"
            style={{ color: ODPC_BLUE }}
          >
            support@praxis.co.ke
          </a>
          {error.digest && (
            <p className="mt-3 font-mono text-xs text-zinc-400">
              Reference: {error.digest}
            </p>
          )}
        </div>

        <p className="mt-8 text-xs text-zinc-400">
          Praxis — ODPC Compliance Infrastructure
        </p>
      </div>
    </div>
  );
}