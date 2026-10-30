'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

const EMPLOYEES = ['1-9', '10-49', '50-99', '99+'];

const TURNOVER = [
  { v: '<2M', l: 'Less than KES 2,000,000' },
  { v: '2M-5M', l: 'KES 2,000,000 - 5,000,000' },
  { v: '5M-10M', l: 'KES 5,000,000 - 10,000,000' },
  { v: '10M-50M', l: 'KES 10,000,000 - 50,000,000' },
  { v: '50M+', l: 'More than KES 50,000,000' },
];

export default function EmployeesPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [emp, setEmp] = useState('');
  const [turn, setTurn] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      const { data } = await supabase
        .from('clients')
        .select('employee_count, turnover_range')
        .eq('id', clientId)
        .maybeSingle();

      if (data) {
        setEmp(data.employee_count || '');
        setTurn(data.turnover_range || '');
      }
      setFetching(false);
    }
    loadData();
  }, [clientId, supabase]);

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
            .from('clients')
            .update({
              employee_count: emp,
              turnover_range: turn,
            })
            .eq('id', clientId)
            .then((updateRes) => {
              if (updateRes.error) {
                setError(updateRes.error.message);
                setLoading(false);
                return;
              }

              supabase
                .from('audit_log')
                .insert({
                  firm_id: firmId,
                  client_id: clientId,
                  user_id: user.id,
                  action: 'intake_submitted',
                  entity_type: 'clients',
                  entity_id: clientId,
                })
                .then(() => {
                  router.push('/firm/clients/' + clientId);
                  router.refresh();
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
          Section 6 of 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Employees and turnover
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <h2 className="text-sm font-medium text-zinc-700">
              Number of employees
            </h2>
            <div className="mt-3 space-y-2">
              {EMPLOYEES.map((o) => (
                <label key={o} className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="emp"
                    checked={emp === o}
                    onChange={() => setEmp(o)}
                    className="h-4 w-4"
                  />
                  {o === '99+' ? 'More than 99 employees' : o + ' employees'}
                </label>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-medium text-zinc-700">
              Previous year annual turnover
            </h2>
            <div className="mt-3 space-y-2">
              {TURNOVER.map((o) => (
                <label key={o.v} className="flex items-center gap-3 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="turn"
                    checked={turn === o.v}
                    onChange={() => setTurn(o.v)}
                    className="h-4 w-4"
                  />
                  {o.l}
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <Link
              href={'/firm/clients/' + clientId + '/intake/measures'}
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
              {loading ? 'Saving...' : 'Submit intake form'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}