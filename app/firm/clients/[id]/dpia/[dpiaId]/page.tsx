'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';

type RiskItem = {
  risk: string;
  impact: string;
  likelihood: string;
  actions: string;
};

type Dpia = {
  id: string;
  client_id: string;
  project_name: string;
  assessment_need: string;
  project_outline: string;
  personal_data_types: string;
  information_flow: string;
  compliance_measures: string;
  risk_assessment: RiskItem[];
  status: string;
  created_at: string;
};

export default function DpiaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const dpiaId = params.dpiaId as string;
  const supabase = createClient();

  const [dpia, setDpia] = useState<Dpia | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle();

      if (client) setClientName(client.name);

      const { data, error: fetchErr } = await supabase
        .from('client_dpias')
        .select('*')
        .eq('id', dpiaId)
        .eq('client_id', clientId)
        .maybeSingle();

      if (fetchErr) {
        setError(fetchErr.message);
      } else if (data) {
        // Ensure risk_assessment is parsed correctly if it comes as a string
        const parsedRisks = typeof data.risk_assessment === 'string' 
          ? JSON.parse(data.risk_assessment) 
          : data.risk_assessment;
          
        setDpia({ ...data, risk_assessment: parsedRisks || [] });
      }
      setLoading(false);
    }
    load();
  }, [dpiaId, clientId, supabase]);

  async function handleSignOff() {
    if (!dpia) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('client_dpias')
      .update({ 
        status: 'completed',
        signed_off_at: new Date().toISOString()
      })
      .eq('id', dpia.id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setDpia({ ...dpia, status: 'completed' });
    setSaving(false);
    router.refresh();
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!dpia) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-20 text-center">
        <p className="text-sm text-zinc-500">DPIA not found.</p>
        <Link
          href={'/firm/clients/' + clientId + '/dpia'}
          className="mt-4 inline-block text-sm font-medium"
          style={{ color: ODPC_BLUE }}
        >
          Back to DPIA list
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId + '/dpia'} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <Link
            href={'/firm/clients/' + clientId + '/dpia'}
            className="text-sm text-zinc-500"
          >
            Back to DPIA list
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            {clientName}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {dpia.project_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Created on {new Date(dpia.created_at).toLocaleDateString('en-GB')}
              </p>
            </div>
            <span
              className={
                'inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ' +
                (dpia.status === 'completed'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-amber-50 text-amber-700')
              }
            >
              {dpia.status}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-4" style={{ color: ODPC_BLUE }}>
              Part 1: Description of Processing
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Assessment Need</dt>
                <dd className="mt-1 text-sm text-zinc-700">{dpia.assessment_need}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Project Outline</dt>
                <dd className="mt-1 text-sm text-zinc-700">{dpia.project_outline}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Personal Data Involved</dt>
                <dd className="mt-1 text-sm text-zinc-700">{dpia.personal_data_types}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Information Flow</dt>
                <dd className="mt-1 text-sm text-zinc-700">{dpia.information_flow}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-4" style={{ color: ODPC_BLUE }}>
              Part 2: Necessity and Proportionality
            </h2>
            <p className="text-sm text-zinc-700 leading-relaxed">
              {dpia.compliance_measures}
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-4" style={{ color: ODPC_BLUE }}>
              Part 3: Risk Assessment
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-zinc-700">
                <thead className="bg-zinc-50 border-b border-zinc-200">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Risk</th>
                    <th className="px-4 py-3 font-semibold">Impact</th>
                    <th className="px-4 py-3 font-semibold">Likelihood</th>
                    <th className="px-4 py-3 font-semibold">Mitigation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {dpia.risk_assessment.map((r, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3">{r.risk}</td>
                      <td className="px-4 py-3">{r.impact}</td>
                      <td className="px-4 py-3">{r.likelihood}</td>
                      <td className="px-4 py-3">{r.actions}</td>
                    </tr>
                  ))}
                  {dpia.risk_assessment.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-6 text-center text-zinc-500 italic">No risks recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-zinc-200 pt-6">
          <div className="flex flex-wrap gap-3">
            <a
              href={'/api/firm/generate-dpia/' + dpia.id}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Download DPIA Report (PDF)
            </a>
            {dpia.status !== 'completed' && (
              <button
                type="button"
                onClick={handleSignOff}
                disabled={saving}
                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: GREEN }}
              >
                {saving ? 'Saving...' : 'Mark as Completed and Signed Off'}
              </button>
            )}
          </div>
          <Link
            href={'/firm/clients/' + clientId}
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Return to Client Dashboard
          </Link>
        </div>
      </main>
    </div>
  );
}