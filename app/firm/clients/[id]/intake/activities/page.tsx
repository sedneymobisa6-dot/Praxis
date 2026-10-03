'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function ActivitiesPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [cats, setCats] = useState<string[]>(['']);
  const [datas, setDatas] = useState<string[]>(['']);
  const [purps, setPurps] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function addRow() {
    const c = [...cats];
    const d = [...datas];
    const p = [...purps];
    c.push('');
    d.push('');
    p.push('');
    setCats(c);
    setDatas(d);
    setPurps(p);
  }

  function updateRow(index: number, field: string, value: string) {
    if (field === 'cat') {
      const c = [...cats];
      c[index] = value;
      setCats(c);
    } else if (field === 'data') {
      const d = [...datas];
      d[index] = value;
      setDatas(d);
    } else {
      const p = [...purps];
      p[index] = value;
      setPurps(p);
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
            .from('client_processing_activities')
            .delete()
            .eq('client_id', clientId)
            .then(() => {
              const rows: any[] = [];
              for (let i = 0; i < cats.length; i++) {
                if (cats[i] && datas[i] && purps[i]) {
                  rows.push({
                    firm_id: firmId,
                    client_id: clientId,
                    data_subject_category: cats[i],
                    personal_data_description: datas[i],
                    purpose_of_processing: purps[i],
                  });
                }
              }

              if (rows.length === 0) {
                router.push('/firm/clients/' + clientId + '/intake/sensitive');
                return;
              }

              supabase
                .from('client_processing_activities')
                .insert(rows)
                .then(() => {
                  router.push('/firm/clients/' + clientId + '/intake/sensitive');
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
          Section 2 of 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Personal data processed
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {cats.map((_, i) => (
            <div key={i} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm space-y-3">
              <input
                type="text"
                value={cats[i]}
                onChange={(e) => updateRow(i, 'cat', e.target.value)}
                placeholder="Category (students, customers, patients, staff)"
                className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
              <input
                type="text"
                value={datas[i]}
                onChange={(e) => updateRow(i, 'data', e.target.value)}
                placeholder="Data collected"
                className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
              />
              <input
                type="text"
                value={purps[i]}
                onChange={(e) => updateRow(i, 'purp', e.target.value)}
                placeholder="Purpose"
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
              href={'/firm/clients/' + clientId + '/intake/basic'}
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