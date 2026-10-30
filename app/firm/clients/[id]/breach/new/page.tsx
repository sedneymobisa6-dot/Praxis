'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';
const RED = '#DC2626';

export default function NewBreachPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [clientName, setClientName] = useState('');

  const [discoveredAt, setDiscoveredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [reportedBy, setReportedBy] = useState('');
  const [description, setDescription] = useState('');
  const [cause, setCause] = useState('');
  const [subjectsAffected, setSubjectsAffected] = useState('');
  const [categoriesAffected, setCategoriesAffected] = useState('');
  const [potentialHarm, setPotentialHarm] = useState('');
  const [remedialActions, setRemedialActions] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClient() {
      const { data } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle();

      if (data) setClientName(data.name);
    }
    loadClient();
  }, [clientId, supabase]);

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
        reported_by: reportedBy.trim() || null,
        breach_description: description.trim(),
        breach_cause: cause.trim() || null,
        data_subjects_affected: subjectsAffected ? parseInt(subjectsAffected, 10) : null,
        data_categories_affected: categoriesAffected.trim() || null,
        potential_harm: potentialHarm.trim() || null,
        remedial_actions: remedialActions.trim() || null,
        odpc_notified: false,
        data_subjects_notified: false,
        status: 'open',
      })
      .select()
      .single();

    if (insertError || !created) {
      setError(insertError?.message ?? 'Could not save the breach record.');
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
      metadata: { discovered_at: discoveredAt, subjects_affected: subjectsAffected },
    });

    router.push('/firm/clients/' + clientId + '/breach/' + created.id);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
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
          Record the breach. The system will track the 72-hour ODPC notification window.
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
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the breach in plain language. What data was affected? How was it accessed or lost?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Cause
                </label>
                <input
                  type="text"
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  placeholder="E.g., stolen laptop, phishing, misdirected email"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Number of subjects affected
                  </label>
                  <input
                    type="number"
                    value={subjectsAffected}
                    onChange={(e) => setSubjectsAffected(e.target.value)}
                    placeholder="E.g., 120"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Categories of data affected
                  </label>
                  <input
                    type="text"
                    value={categoriesAffected}
                    onChange={(e) => setCategoriesAffected(e.target.value)}
                    placeholder="E.g., Names, NHIF numbers"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Potential harm
                </label>
                <textarea
                  rows={2}
                  value={potentialHarm}
                  onChange={(e) => setPotentialHarm(e.target.value)}
                  placeholder="What harm could come to the affected individuals?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Remedial actions taken
                </label>
                <textarea
                  rows={2}
                  value={remedialActions}
                  onChange={(e) => setRemedialActions(e.target.value)}
                  placeholder="What have you done so far to contain the breach?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
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