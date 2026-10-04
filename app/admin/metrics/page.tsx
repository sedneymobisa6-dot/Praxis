import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/checkAdmin';

const ODPC_BLUE = '#0A3D62';

export default async function AdminMetrics() {
  const { user } = await requireAdmin();
  const supabase = createClient();

  const { data: firms } = await supabase
    .from('firms')
    .select('id, subscription_status, monthly_fee_kes');

  const { data: clients } = await supabase
    .from('clients')
    .select('id, created_at');

  const { data: dsars } = await supabase
    .from('client_dsar_requests')
    .select('id');

  const { data: breaches } = await supabase
    .from('client_breaches')
    .select('id');

  const totalFirms = firms?.length ?? 0;
  const activeFirms = (firms ?? []).filter((f) => f.subscription_status === 'active').length;
  const trialFirms = (firms ?? []).filter((f) => f.subscription_status === 'trial').length;
  const suspendedFirms = (firms ?? []).filter((f) => f.subscription_status === 'suspended').length;

  const totalClients = clients?.length ?? 0;

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const clientsLast30 = (clients ?? []).filter(
    (c) => new Date(c.created_at) >= thirtyDaysAgo
  ).length;

  const mrr = (firms ?? [])
    .filter((f) => f.subscription_status === 'active')
    .reduce((sum, f) => sum + (f.monthly_fee_kes ?? 0), 0);

  const totalDsars = dsars?.length ?? 0;
  const totalBreaches = breaches?.length ?? 0;

  const metrics = [
    { label: 'Total firms', value: totalFirms },
    { label: 'Active firms', value: activeFirms },
    { label: 'Trial firms', value: trialFirms },
    { label: 'Suspended firms', value: suspendedFirms },
    { label: 'Total clients', value: totalClients },
    { label: 'Clients added (30 days)', value: clientsLast30 },
    { label: 'Monthly recurring revenue', value: 'KES ' + mrr.toLocaleString() },
    { label: 'DSARs logged (all time)', value: totalDsars },
    { label: 'Breaches logged (all time)', value: totalBreaches },
  ];

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
          <div className="flex items-center gap-4">
            <Link
              href="/admin/metrics"
              className="text-sm font-medium"
              style={{ color: ODPC_BLUE }}
            >
              Metrics
            </Link>
            <Link
              href="/admin/audit"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Audit log
            </Link>
            <span className="hidden text-sm text-zinc-500 md:inline">
              {user.email}
            </span>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Metrics
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            The state of Praxis at a glance.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {m.label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}