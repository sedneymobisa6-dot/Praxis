'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

const OPTIONS = [
  'Racial or ethnic origin',
  'Political opinion or adherence',
  'Religious or philosophical beliefs',
  'Marital status and family details',
  'Physical or mental health or condition',
  'Sexual orientation, practices or preferences',
  'Biometric data',
];

export default function SensitivePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [applicable, setApplicable] = useState(false);
  const [types, setTypes] = useState<string[]>([]);
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function toggle(t: string) {
    if (types.includes(t)) {
      setTypes(types.filter((x) => x !== t));
    } else {
      const arr = [...types];
      arr.push(t);
      setTypes(arr);
    }
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
            .from('client_sensitive_data')
            .delete()
            .eq('client_id', clientId)
            .then(() => {
              supabase
                .from('client_sensitive_data')
                .insert({
                  firm_id: firmId,
                  client_id: clientId,
                  applicable: applicable,
                  data_types: types,
                  purpose: purpose,
                })
                .then(() => {
                  router.push('/firm/clients/' + clientId + '/intake/transfers');
                });
            });
        });
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId} className="flex items-center gap-3">
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
          Section 3 of 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Sensitive personal data
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setApplicable(true)}
              className="rounded-lg px-4 py-2 text-sm"
              style={
                applicable
                  ? { backgroundColor: ODPC_BLUE, color: 'white' }
                  : { border: '1px solid #d4d4d8' }
              }
            >
              Applicable
            </button>
            <button
              type="button"
              onClick={() => setApplicable(false)}
              className="rounded-lg px-4 py-2 text-sm"
              style={
                !applicable
                  ? { backgroundColor: ODPC_BLUE, color: 'white' }
                  : { border: '1px solid #d4d4d8' }
              }
            >
              Not applicable
            </button>
          </div>

          {applicable && (
            <div className="space-y-2 pt-2">
              {OPTIONS.map((t) => (
                <label key={t} className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={types.includes(t)}
                    onChange={() => toggle(t)}
                    className="h-4 w-4"
                  />
                  {t}
                </label>
              ))}
              <input
                type="text"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Purpose"
                className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
            </div>
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href={'/firm/clients/' + clientId + '/intake/activities'}
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