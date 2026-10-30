'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

export default function MeasuresPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [risks, setRisks] = useState<string[]>(['']);
  const [safes, setSafes] = useState<string[]>(['']);
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadMeasures() {
      const { data } = await supabase
        .from('client_security_measures')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order', { ascending: true });

      if (data && data.length > 0) {
        setRisks(data.map((d) => d.risk_description));
        setSafes(data.map((d) => d.safeguard_description));
      }
      setFetching(false);
    }
    loadMeasures();
  }, [clientId, supabase]);

  function addRow() {
    setRisks([...risks, '']);
    setSafes([...safes, '']);
  }

  function updateRisk(i: number, v: string) {
    const newRisks = [...risks];
    newRisks[i] = v;
    setRisks(newRisks);
  }

  function updateSafe(i: number, v: string) {
    const newSafes = [...safes];
    newSafes[i] = v;
    setSafes(newSafes);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    supabase.auth.getUser().then((r1) => {
      const user = r1.data.user;
      if (!user) {
        setError('Not signed in.');
        setLoading(false);
        return;
      }

      supabase
        .from('firm_users')
        .select('firm_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then((r2) => {
          if (!r2.data) {
            setError('Firm not found.');
            setLoading(false);
            return;
          }

          const firmId = r2.data.firm_id;

          supabase
            .from('client_security_measures')
            .delete()
            .eq('client_id', clientId)
            .then(() => {
              const rows: any[] = [];
              for (let i = 0; i < risks.length; i++) {
                if (risks[i].trim() && safes[i].trim()) {
                  rows.push({
                    firm_id: firmId,
                    client_id: clientId,
                    risk_description: risks[i].trim(),
                    safeguard_description: safes[i].trim(),
                    display_order: i + 1,
                  });
                }
              }

              if (rows.length === 0) {
                router.push('/firm/clients/' + clientId + '/intake/employees');
                return;
              }

              supabase
                .from('client_security_measures')
                .insert(rows)
                .then((res) => {
                  if (res.error) {
                    setError(res.error.message);
                    setLoading(false);
                    return;
                  }
                  router.push('/firm/clients/' + clientId + '/intake/employees');
                });
            });
        });
    });
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <Link href={'/firm/clients/' + clientId} className="text-sm text-zinc-500">
            Cancel
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: ODPC_BLUE }}
        >
          Section 5 of 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Security measures
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {risks.map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
              <input
                type="text"
                value={risks[i]}
                onChange={(e) => updateRisk(i, e.target.value)}
                placeholder="Risk (e.g., unauthorized access, theft)"
                className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
              <input
                type="text"
                value={safes[i]}
                onChange={(e) => updateSafe(i, e.target.value)}
                placeholder="Safeguard (e.g., access control, encryption)"
                className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          ))}

          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium"
            style={{ color: ODPC_BLUE }}
          >
            + Add another
          </button>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href={'/firm/clients/' + clientId + '/intake/transfers'}
              className="text-sm text-zinc-600"
            >
              Back
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {loading ? 'Saving...' : 'Continue'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}