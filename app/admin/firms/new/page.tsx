'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { SECTOR_LIST } from '@/lib/sectors';

const ODPC_BLUE = '#0A3D62';

const TIERS = [
  { value: 'starter', label: 'Starter (5 clients)', limit: 5, fee: 10000 },
  { value: 'small', label: 'Small (10 clients)', limit: 10, fee: 20000 },
  { value: 'growth', label: 'Growth (20 clients)', limit: 20, fee: 35000 },
  { value: 'professional', label: 'Professional (50 clients)', limit: 50, fee: 60000 },
  { value: 'business', label: 'Business (100 clients)', limit: 100, fee: 100000 },
  { value: 'enterprise', label: 'Enterprise (200 clients)', limit: 200, fee: 150000 },
  { value: 'custom', label: 'Custom (200+)', limit: 9999, fee: 200000 },
];

export default function NewFirmPage() {
  const router = useRouter();

  const [firmName, setFirmName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [sector, setSector] = useState('education');
  const [tier, setTier] = useState('starter');
  const [clientLimit, setClientLimit] = useState('5');
  const [monthlyFee, setMonthlyFee] = useState('10000');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function onTierChange(value: string) {
    setTier(value);
    const found = TIERS.find((t) => t.value === value);
    if (found) {
      setClientLimit(String(found.limit));
      setMonthlyFee(String(found.fee));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const limitNum = parseInt(clientLimit, 10);
    const feeNum = parseInt(monthlyFee, 10);

    if (isNaN(limitNum) || isNaN(feeNum)) {
      setError('Client limit and monthly fee must be numbers.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/admin/create-firm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firmName,
          contactEmail,
          contactPhone,
          ownerName,
          ownerEmail,
          sector,
          tier,
          clientLimit: limitNum,
          monthlyFee: feeNum,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not create firm.');
        setLoading(false);
        return;
      }

      setSuccess(
        'Firm created. An invite has been sent to ' +
          ownerEmail +
          '. Redirecting...'
      );

      setTimeout(() => {
        router.push('/admin');
        router.refresh();
      }, 1800);
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </div>
            <span className="text-base font-semibold text-zinc-900">
              Praxis Admin
            </span>
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cancel
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            New Firm
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Create a firm on behalf of a client
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            The owner will receive an email invitation to set their password
            and access the dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Firm Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Firm name
                </label>
                <input
                  type="text"
                  required
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  placeholder="Riverside Medical Centre"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Contact email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="admin@firm.co.ke"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Leave blank to use the owner email.
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Contact phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Sector
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                >
                  {SECTOR_LIST.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Owner Account
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Owner full name
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="Jane Wanjiku"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Owner email
                </label>
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="jane@firm.co.ke"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  An invitation link will be sent here. The link expires in 7
                  days.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Subscription
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Tier
                </label>
                <select
                  value={tier}
                  onChange={(e) => onTierChange(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                >
                  {TIERS.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Client limit
                  </label>
                  <input
                    type="number"
                    required
                    value={clientLimit}
                    onChange={(e) => setClientLimit(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Monthly fee (KES)
                  </label>
                  <input
                    type="number"
                    required
                    value={monthlyFee}
                    onChange={(e) => setMonthlyFee(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/admin"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {loading ? 'Creating...' : 'Create firm and send invite'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}