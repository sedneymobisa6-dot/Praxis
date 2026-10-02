'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const RED = '#DC2626';

export default function NewBreachPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [clientName, setClientName] = useState('');

  const [discoveredAt, setDiscoveredAt] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [reportedBy, setReportedBy] = useState('');
  const [breachDescription, setBreachDescription] = useState('');
  const [breachCause, setBreachCause] = useState('');
  const [dataSubjectsAffected, setDataSubjectsAffected] = useState('');
  const [dataCategoriesAffected, setDataCategoriesAffected] = useState('');
  const [potentialHarm, setPotentialHarm] = useState('');
  const [remedialActions, setRemedialActions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle();
      if (client) setClientName(client.name);
    }
    load();
  }, [clientId, supabase]);

  const deadline = (() => {
    const d = new Date(discoveredAt);
    d.setHours(d.getHours() + 72);
    return d;
  })();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setLoading(false);
      return;
    }

    const { data: firmUser } = await supabase
      .from('firm_users')
      .select('firm_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!firmUser) {
      setError('Could not find your firm.');
      setLoading(false);
      return;
    }

    const { data: created, error: insertError } = await supabase
      .from('client_breaches')
      .insert({
        firm_id: firmUser.firm_id,
        client_id: clientId,
        discovered_at: new Date(discoveredAt).toISOString(),
        reported_by: reportedBy,
        breach_description: breachDescription,
        breach_cause: breachCause,
        data_subjects_affected: dataSubjectsAffected
          ? parseInt(dataSubjectsAffected, 10)
          : null,
        data_categories_affected: dataCategoriesAffected,
        potential_harm: potentialHarm,
        remedial_actions: remedialActions,
        status: 'open',
      })
      .select()
      .single();

    if (insertError || !created) {
      setError(insertError?.message ?? 'Could not save breach.');
      setLoading(false);
      return;
    }

    await supabase.from('audit_log').insert({
      firm_id: firmUser.firm_id,
      client_id: clientId,
      user_id: user.id,
      action: 'breach_reported',
      entity_type: 'client_breaches',
      entity_id: created.id,
    });

    router.push('/firm/clients/' + clientId + '/breach/' + created.id);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href={'/firm/clients/' + clientId + '/breach'}
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
            href={'/firm/clients/' + clientId + '/breach'}
            className="text-sm text-zinc-500"
          >
            Cancel
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: RED }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: RED }}
        >
          {clientName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Report a Data Breach
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Record the breach. The system will track the 72-hour ODPC notification
          window.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Discovery
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  When was the breach discovered?
                </label>
                <input
                  type="datetime-local"
                  required
                  value={discoveredAt}
                  onChange={(e) => setDiscoveredAt(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
                <p className="mt-1 text-xs text-zinc-500">
                  The 72-hour notification window starts from this moment.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Reported by
                </label>
                <input
                  type="text"
                  value={reportedBy}
                  onChange={(e) => setReportedBy(e.target.value)}
                  placeholder="Name of person reporting the breach"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Breach Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  What happened? *
                </label>
                <textarea
                  required
                  rows={4}
                  value={breachDescription}
                  onChange={(e) => setBreachDescription(e.target.value)}
                  placeholder="Describe the breach in plain language. What data was affected? How was it accessed or lost?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  How did it happen?
                </label>
                <textarea
                  rows={3}
                  value={breachCause}
                  onChange={(e) => setBreachCause(e.target.value)}
                  placeholder="Root cause if known. E.g. stolen laptop, unauthorised access, accidental disclosure."
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Number of data subjects affected
                </label>
                <input
                  type="number"
                  min="0"
                  value={dataSubjectsAffected}
                  onChange={(e) => setDataSubjectsAffected(e.target.value)}
                  placeholder="e.g. 45"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Categories of personal data affected
                </label>
                <textarea
                  rows={3}
                  value={dataCategoriesAffected}
                  onChange={(e) => setDataCategoriesAffected(e.target.value)}
                  placeholder="E.g. names, dates of birth, examination records, medical information"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Potential harm to affected persons
                </label>
                <textarea
                  rows={3}
                  value={potentialHarm}
                  onChange={(e) => setPotentialHarm(e.target.value)}
                  placeholder="E.g. identity theft, reputational damage, distress"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Remedial Actions
            </h2>

            <div className="mt-5">
              <label className="block text-sm font-medium text-zinc-700">
                What has been done so far?
              </label>
              <textarea
                rows={4}
                value={remedialActions}
                onChange={(e) => setRemedialActions(e.target.value)}
                placeholder="E.g. passwords reset, access revoked, affected persons informed"
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>

          <div
            className="rounded-lg border p-4"
            style={{ borderColor: RED, backgroundColor: '#FEF2F2' }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
              ODPC Notification Deadline
            </p>
            <p className="mt-1 text-sm text-zinc-700">
              You must notify the Office of the Data Protection Commissioner by{' '}
              <span className="font-semibold text-zinc-900">
                {deadline.toLocaleString('en-GB', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              . This is 72 hours from discovery.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href={'/firm/clients/' + clientId + '/breach'}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: RED }}
            >
              {loading ? 'Saving...' : 'Save breach report'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}