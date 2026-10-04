import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/checkAdmin';

const ODPC_BLUE = '#0A3D62';

function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const tierLabels: Record<string, string> = {
  starter: 'Starter (1-5)',
  small: 'Small (6-10)',
  growth: 'Growth (11-20)',
  professional: 'Professional (21-50)',
  business: 'Business (51-100)',
  enterprise: 'Enterprise (101-200)',
  custom: 'Custom (200+)',
};

export default async function AdminPage() {
  const { user } = await requireAdmin();
  const supabase = createClient();

  const { data: firms } = await supabase
    .from('firms')
    .select('id, name, contact_email, subscription_status, tier, client_limit, monthly_fee_kes, created_at, trial_ends_at')
    .order('created_at', { ascending: false });

  const firmIds = (firms ?? []).map((f) => f.id);

  let clientCounts: Record<string, number> = {};

  if (firmIds.length > 0) {
    const { data: clients } = await supabase
      .from('clients')
      .select('firm_id')
      .in('firm_id', firmIds);

    (clients ?? []).forEach((c) => {
      clientCounts[c.firm_id] = (clientCounts[c.firm_id] ?? 0) + 1;
    });
  }

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    return Response.redirect('https://praxis-beta-five.vercel.app/firm/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
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
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 md:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
              >
                Sign out
              </button>
            </form>
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
            Firms
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {firms?.length ?? 0} {(firms?.length === 1) ? 'firm' : 'firms'} on the platform
          </p>
        </div>

        {!firms || firms.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">No firms yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              When a firm registers on Praxis, they will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Firm
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Clients
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Fee / mo
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Status
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Signed up
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {firms.map((firm) => {
                  const count = clientCounts[firm.id] ?? 0;
                  const overLimit = firm.client_limit ? count > firm.client_limit : false;
                  let statusColor = 'text-green-700';
                  let statusBg = 'bg-green-50';
                  if (firm.subscription_status === 'trial') {
                    statusColor = 'text-blue-700';
                    statusBg = 'bg-blue-50';
                  } else if (firm.subscription_status === 'suspended') {
                    statusColor = 'text-red-700';
                    statusBg = 'bg-red-50';
                  } else if (firm.subscription_status === 'cancelled') {
                    statusColor = 'text-zinc-600';
                    statusBg = 'bg-zinc-100';
                  }
                  return (
                    <tr key={firm.id} className="hover:bg-zinc-50">
                      <td className="px-6 py-4">
                        <Link
                          href={'/admin/firms/' + firm.id}
                          className="text-sm font-medium text-zinc-900 hover:underline"
                        >
                          {firm.name}
                        </Link>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {firm.contact_email || '—'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            'text-sm font-medium ' +
                            (overLimit ? 'text-red-600' : 'text-zinc-900')
                          }
                        >
                          {count}
                          {firm.client_limit ? ' / ' + firm.client_limit : ''}
                        </span>
                        {overLimit && (
                          <p className="mt-0.5 text-xs text-red-600">
                            Over limit
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700">
                        {tierLabels[firm.tier ?? 'starter'] ?? firm.tier}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-900">
                        KES {(firm.monthly_fee_kes ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={
                            'inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' +
                            statusBg +
                            ' ' +
                            statusColor
                          }
                        >
                          {firm.subscription_status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-500">
                        {formatDate(firm.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={'/admin/firms/' + firm.id}
                          className="text-xs font-medium"
                          style={{ color: ODPC_BLUE }}
                        >
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-zinc-400">
          Praxis Admin · Mobi Enterprise Solutions Limited
        </div>
      </main>
    </div>
  );
}