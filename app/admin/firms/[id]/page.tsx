import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/checkAdmin';
import FirmControls from './FirmControls';

const ODPC_BLUE = '#0A3D62';

function formatDate(dateString: string | null) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function AdminFirmDetail(props: {
  params: { id: string };
}) {
  await requireAdmin();
  const supabase = createClient();

  const { data: firm } = await supabase
    .from('firms')
    .select('*')
    .eq('id', props.params.id)
    .maybeSingle();

  if (!firm) {
    return (
      <div className="min-h-screen bg-zinc-50 px-6 py-20 text-center">
        <p className="text-sm text-zinc-500">Firm not found.</p>
        <Link
          href="/admin"
          className="mt-4 inline-block text-sm font-medium"
          style={{ color: ODPC_BLUE }}
        >
          Back to firms
        </Link>
      </div>
    );
  }

  const { data: firmUsers } = await supabase
    .from('firm_users')
    .select('id, full_name, role, created_at')
    .eq('firm_id', firm.id);

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, sector, created_at')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false });

  const { data: recentActivity } = await supabase
    .from('audit_log')
    .select('action, created_at')
    .eq('firm_id', firm.id)
    .order('created_at', { ascending: false })
    .limit(10);

  const clientCount = clients?.length ?? 0;
  const overLimit = firm.client_limit ? clientCount > firm.client_limit : false;

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
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to firms
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            Firm
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {firm.name}
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            {firm.contact_email || '—'}
            {firm.contact_phone ? ' · ' + firm.contact_phone : ''}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Subscription
            </h2>
            <dl className="mt-5 space-y-3">
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Status</dt>
                <dd className="text-sm font-medium capitalize text-zinc-900">
                  {firm.subscription_status}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Tier</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {firm.tier || '—'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Client limit</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {firm.client_limit || '—'}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Monthly fee</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  KES {(firm.monthly_fee_kes ?? 0).toLocaleString()}
                </dd>
              </div>
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Billing start</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {formatDate(firm.billing_start_date)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500">Signed up</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {formatDate(firm.created_at)}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Clients
            </h2>
            <p className="mt-3 text-sm text-zinc-500">
              <span className={'font-medium ' + (overLimit ? 'text-red-600' : 'text-zinc-900')}>
                {clientCount}
              </span>{' '}
              {clientCount === 1 ? 'client' : 'clients'}
              {firm.client_limit ? ' of ' + firm.client_limit + ' allowed' : ''}
            </p>
            {overLimit && (
              <p className="mt-2 text-xs font-medium text-red-600">
                Over the client limit for this tier.
              </p>
            )}
            <div className="mt-5 space-y-2">
              {(clients ?? []).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2"
                >
                  <div>
                    <p className="text-sm text-zinc-900">{c.name}</p>
                    <p className="text-xs capitalize text-zinc-500">{c.sector}</p>
                  </div>
                  <Link
                    href={'/firm/clients/' + c.id}
                    className="text-xs font-medium"
                    style={{ color: ODPC_BLUE }}
                  >
                    View
                  </Link>
                </div>
              ))}
              {(!clients || clients.length === 0) && (
                <p className="text-sm text-zinc-400">No clients yet.</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <FirmControls
            firmId={firm.id}
            currentTier={firm.tier || 'starter'}
            currentLimit={firm.client_limit || 5}
            currentFee={firm.monthly_fee_kes || 10000}
            currentStatus={firm.subscription_status}
          />
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Users
          </h2>
          <div className="mt-5 space-y-2">
            {(firmUsers ?? []).map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-3 py-2"
              >
                <p className="text-sm text-zinc-900">{u.full_name || '—'}</p>
                <p className="text-xs capitalize text-zinc-500">{u.role}</p>
              </div>
            ))}
            {(!firmUsers || firmUsers.length === 0) && (
              <p className="text-sm text-zinc-400">No users yet.</p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Recent Activity
          </h2>
          <ul className="mt-5 space-y-3">
            {(recentActivity ?? []).map((a, i) => (
              <li key={i} className="flex items-center justify-between">
                <p className="text-sm capitalize text-zinc-900">
                  {String(a.action).replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(a.created_at).toLocaleString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </li>
            ))}
            {(!recentActivity || recentActivity.length === 0) && (
              <p className="text-sm text-zinc-400">No activity yet.</p>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}