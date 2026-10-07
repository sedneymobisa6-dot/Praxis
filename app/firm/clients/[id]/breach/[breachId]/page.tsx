'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';
const RED = '#DC2626';

type Breach = {
  id: string;
  client_id: string;
  discovered_at: string;
  reported_by: string | null;
  breach_description: string;
  breach_cause: string | null;
  data_subjects_affected: number | null;
  data_categories_affected: string | null;
  potential_harm: string | null;
  remedial_actions: string | null;
  odpc_notified: boolean;
  odpc_notified_at: string | null;
  data_subjects_notified: boolean;
  data_subjects_notified_at: string | null;
  status: string;
  created_at: string;
};

function formatDateTime(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function hoursUntil72(discoveredAt: string) {
  const deadline = new Date(discoveredAt).getTime() + 72 * 60 * 60 * 1000;
  return Math.ceil((deadline - Date.now()) / (1000 * 60 * 60));
}

export default function BreachDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const breachId = params.breachId as string;
  const supabase = createClient();

  const [breach, setBreach] = useState<Breach | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .maybeSingle();

    if (client) setClientName(client.name);

    const { data, error: fetchErr } = await supabase
      .from('client_breaches')
      .select('*')
      .eq('id', breachId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (fetchErr) {
      setError(fetchErr.message);
      setLoading(false);
      return;
    }

    setBreach((data as Breach) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breachId, clientId]);

  async function markReported(mark: 'odpc_notified' | 'data_subjects_notified') {
    if (!breach) return;
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(
        '/api/firm/breach/' + breach.id + '/mark-reported',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mark }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not update breach.');
        setSaving(false);
        return;
      }

      setSuccess(
        mark === 'odpc_notified'
          ? 'Marked as reported to the ODPC.'
          : 'Marked as data subjects notified.'
      );

      await load();
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  if (!breach) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-zinc-500">Breach not found.</p>
          <Link
            href={'/firm/clients/' + clientId}
            className="mt-4 inline-block text-sm font-medium"
            style={{ color: ODPC_BLUE }}
          >
            Back to client
          </Link>
        </main>
      </div>
    );
  }

  const hours = hoursUntil72(breach.discovered_at);
  const isOverdue = hours <= 0;
  const isUrgent = hours > 0 && hours <= 12;

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href={'/firm/clients/' + clientId}
            className="flex items-center gap-3"
          >
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
            <span className="text-base font-semibold text-zinc-900">Praxis</span>
          </Link>
          <Link
            href={'/firm/clients/' + clientId}
            className="text-sm text-zinc-500"
          >
            Back to client
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
            {clientName}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Data Breach
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Discovered {formatDateTime(breach.discovered_at)}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {!breach.odpc_notified && (
          <div
            className={
              'mb-6 rounded-2xl border p-6 ' +
              (isOverdue
                ? 'border-red-200 bg-red-50'
                : isUrgent
                  ? 'border-amber-200 bg-amber-50'
                  : 'border-zinc-200 bg-white')
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p
                  className={
                    'text-xs font-semibold uppercase tracking-wider ' +
                    (isOverdue
                      ? 'text-red-700'
                      : isUrgent
                        ? 'text-amber-700'
                        : 'text-zinc-500')
                  }
                >
                  72 Hour Notification Window
                </p>
                <p
                  className={
                    'mt-2 text-lg font-semibold ' +
                    (isOverdue
                      ? 'text-red-700'
                      : isUrgent
                        ? 'text-amber-700'
                        : 'text-zinc-900')
                  }
                >
                  {isOverdue
                    ? 'Overdue by ' + Math.abs(hours) + ' hours'
                    : hours + ' hours remaining'}
                </p>
                <p className="mt-1 text-sm text-zinc-500">
                  You must notify the ODPC within 72 hours of becoming aware of
                  the breach.
                </p>
              </div>
              <button
                type="button"
                onClick={() => markReported('odpc_notified')}
                disabled={saving}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 whitespace-nowrap"
                style={{ backgroundColor: GREEN }}
              >
                {saving ? 'Saving...' : 'Mark as reported to ODPC'}
              </button>
            </div>
          </div>
        )}

        {breach.odpc_notified && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-6">
            <div className="flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 13l4 4L19 7"
                  stroke={GREEN}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-green-800">
                  Reported to the ODPC
                </p>
                <p className="text-xs text-green-700">
                  {formatDateTime(breach.odpc_notified_at)}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Breach Description
          </h2>
          <p className="mt-4 text-sm text-zinc-700">
            {breach.breach_description}
          </p>

          {breach.breach_cause && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-zinc-700">
                Cause
              </h3>
              <p className="mt-2 text-sm text-zinc-700">
                {breach.breach_cause}
              </p>
            </>
          )}

          {breach.potential_harm && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-zinc-700">
                Potential harm
              </h3>
              <p className="mt-2 text-sm text-zinc-700">
                {breach.potential_harm}
              </p>
            </>
          )}

          {breach.remedial_actions && (
            <>
              <h3 className="mt-6 text-sm font-semibold text-zinc-700">
                Remedial actions
              </h3>
              <p className="mt-2 text-sm text-zinc-700">
                {breach.remedial_actions}
              </p>
            </>
          )}

          <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-6 sm:grid-cols-2">
            {breach.data_subjects_affected !== null && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Subjects affected
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {breach.data_subjects_affected}
                </dd>
              </div>
            )}
            {breach.data_categories_affected && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Categories affected
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {breach.data_categories_affected}
                </dd>
              </div>
            )}
            {breach.reported_by && (
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Reported by
                </dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {breach.reported_by}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Notify Affected Data Subjects
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Section 43 of the Act requires that affected data subjects are
            notified in writing unless their identity cannot be established.
          </p>

          {breach.data_subjects_notified ? (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-sm font-semibold text-green-800">
                Data subjects notified
              </p>
              <p className="mt-1 text-xs text-green-700">
                {formatDateTime(breach.data_subjects_notified_at)}
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => markReported('data_subjects_notified')}
              disabled={saving}
              className="mt-5 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {saving ? 'Saving...' : 'Mark data subjects notified'}
            </button>
          )}
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Generate ODPC Notification Letter
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Download a formal notification letter to the Data Commissioner for
            this breach. It reflects the current status of the report.
          </p>
          <a
            href={'/api/firm/generate-breach/' + breach.id + '?format=word'}
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Download notification letter (Word)
          </a>
        </div>
      </main>
    </div>
  );
}