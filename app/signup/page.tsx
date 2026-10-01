'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function SignupPage() {
  const supabase = createClient();
  const [schoolName, setSchoolName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          school_name: schoolName,
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  async function handleResend() {
    setResending(true);
    setResent(false);
    await supabase.auth.resend({
      type: 'signup',
      email,
    });
    setResending(false);
    setResent(true);
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left brand panel */}
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
          <span className="text-lg font-semibold text-white">Praxis</span>
        </div>

        <div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight text-white">
            Register your school in minutes.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-blue-100">
            Complete the intake form once, generate your official Form DPR 1,
            and let Praxis watch your 24-month renewal clock so you never appear
            on the ODPC expired list.
          </p>

          <div className="mt-12 space-y-4 border-t border-blue-800 pt-8">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke={ODPC_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-blue-100">Generates the official Form DPR 1 as a PDF</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke={ODPC_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-blue-100">Tracks your 24-month renewal window</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-white flex">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke={ODPC_BLUE} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="text-sm text-blue-100">Email alerts at 60, 30, and 7 days before expiry</p>
            </div>
          </div>
        </div>

        <p className="text-xs text-blue-200">
          © {new Date().getFullYear()} Mobi Enterprise Solutions Limited.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
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
            <span className="text-lg font-semibold text-zinc-950">Praxis</span>
          </div>

          {!submitted ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
                Register your school
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                Create your Praxis account to begin ODPC registration.
              </p>

              <form onSubmit={handleSignup} className="mt-8 space-y-5">
                <div>
                  <label htmlFor="schoolName" className="block text-sm font-medium text-zinc-700">
                    School name
                  </label>
                  <input
                    id="schoolName"
                    type="text"
                    required
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-1"
                    style={{ outlineColor: ODPC_BLUE }}
                    placeholder="Riverside Academy"
                  />
                </div>

                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-zinc-700">
                    Your full name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-1"
                    style={{ outlineColor: ODPC_BLUE }}
                    placeholder="Jane Wanjiku"
                  />
                </div>

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
                    className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-1"
                    style={{ outlineColor: ODPC_BLUE }}
                    placeholder="headteacher@school.ac.ke"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 transition focus:outline-none focus:ring-1"
                    style={{ outlineColor: ODPC_BLUE }}
                    placeholder="At least 8 characters"
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
                  className="flex w-full items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: ODPC_BLUE }}
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-zinc-500">
                Already registered?{' '}
                <Link
                  href="/login"
                  className="font-medium underline-offset-4 hover:underline"
                  style={{ color: ODPC_BLUE }}
                >
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <>
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 8l9 6 9-6M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    stroke={ODPC_BLUE}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>

              <h1 className="mt-6 text-2xl font-semibold tracking-tight text-zinc-950">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-zinc-500">
                We sent a confirmation link to:
              </p>
              <p className="mt-1 text-sm font-medium text-zinc-900 break-all">
                {email}
              </p>

              <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Next steps
                </p>
                <ol className="mt-3 space-y-2 text-sm text-zinc-700">
                  <li>1. Open your email inbox</li>
                  <li>2. Find the message from Praxis</li>
                  <li>3. Tap the confirmation link to activate your account</li>
                  <li>4. Return here and sign in</li>
                </ol>
              </div>

              <p className="mt-6 text-xs text-zinc-500">
                Did not receive the email? Check your spam folder. Some email
                providers take a few minutes to deliver.
              </p>

              {resent && (
                <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
                  Confirmation email resent.
                </div>
              )}

              <button
                onClick={handleResend}
                disabled={resending}
                className="mt-4 text-sm font-medium underline-offset-4 hover:underline disabled:opacity-50"
                style={{ color: ODPC_BLUE }}
              >
                {resending ? 'Resending...' : 'Resend confirmation email'}
              </button>

              <div className="mt-8 border-t border-zinc-100 pt-6">
                <Link
                  href="/login"
                  className="text-sm font-medium underline-offset-4 hover:underline"
                  style={{ color: ODPC_BLUE }}
                >
                  Back to sign in
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}