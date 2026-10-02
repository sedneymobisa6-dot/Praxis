import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const RED = '#DC2626';

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

const sectorLabels: Record<string, string> = {
  education: 'Education',
  finance: 'Finance',
  health: 'Health',
  transport: 'Transport',
  hospitality: 'Hospitality',
  other: 'Other',
};

export default async function FirmDashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/firm/login');
  }

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id, full_name, firms(id, name, subscription_status, trial_ends_at)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!firmUser) {
    redirect('/firm/login');
  }

  const firmId = firmUser.firm_id;
  const firm = (firmUser as any).firms;
  const firmName = firm?.name ?? 'Your Firm';

  const { data: clients } = await supabase
    .from('clients')
    .select('id, name, sector, created_at')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false });

  const clientIds = (clients ?? []).map((c) => c.id);

  let certificates: any[] = [];
  let dsars: any[] = [];
  let breaches: any[] = [];

  if (clientIds.length > 0) {
    const { data: certs } = await supabase
      .from('client_certificates')
      .select('client_id, certificate_number, issued_at, expires_at')
      .in('client_id', clientIds);
    certificates = certs ?? [];

    const { data: ds } = await supabase
      .from('client_dsar_requests')
      .select('client_id, deadline_date, status')
      .in('client_id', clientIds)
      .in('status', ['open', 'in_progress']);
    dsars = ds ?? [];

    const { data: bs } = await supabase
      .from('client_breaches')
      .select('client_id, discovered_at, status')
      .in('client_id', clientIds)
      .in('status', ['open', 'investigating', 'notified']);
    breaches = bs ?? [];
  }

  function getClientStatus(clientId: string) {
    const cert = certificates.find((c) => c.client_id === clientId);
    const openDsars = dsars.filter((d) => d.client_id === clientId).length;
    const openBreaches = breaches.filter((b) => b.client_id === clientId).length;

    let certificateLabel = 'Not registered';
    let certificateColor = 'text-zinc-500';

    if (cert?.expires_at) {
      const days = daysUntil(cert.expires_at);
      if (days <= 0) {
        certificateLabel = 'Expired';
        certificateColor = 'text-red-600';
      } else if (days <= 30) {
        certificateLabel = days + ' days to renewal';
        certificateColor = 'text-red-600';
      } else if (days <= 60) {
        certificateLabel = days + ' days to renewal';
        certificateColor = 'text-amber-600';
      } else {
        certificateLabel = 'Active · ' + days + ' days';
        certificateColor = 'text-green-600';
      }
    }

    return { certificateLabel, certificateColor, openDsars, openBreaches };
  }

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/firm/login');
  }

  const isSuspended = firm?.subscription_status === 'suspended';

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
            <span className="text-base font-semibold text-zinc-900">{firmName}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-zinc-500 md:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      {isSuspended && (
        <div className="bg-red-600 px-6 py-3 text-center text-sm font-medium text-white">
          Your account is suspended. Please contact Praxis to reactivate.
        </div>
      )}

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: ODPC_BLUE }}
            >
              Client Portfolio
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Your Clients
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              {clients?.length ?? 0} {clients?.length === 1 ? 'client' : 'clients'} under management
            </p>
          </div>
          <Link
            href="/firm/clients/new"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 5v14M5 12h14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Add a client
          </Link>
        </div>

        {!clients || clients.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#EBF2F9' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
                  stroke={ODPC_BLUE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900">
              No clients yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Add your first client to start managing their ODPC compliance.
              Each client can be a school, a financial institution, a hospital,
              or any other entity you advise.
            </p>
            <Link
              href="/firm/clients/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Add your first client
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            <div className="divide-y divide-zinc-100">
              {clients.map((client) => {
                const status = getClientStatus(client.id);
                return (
                  <Link
                    key={client.id}
                    href={'/firm/clients/' + client.id}
                    className="flex items-center justify-between gap-4 px-6 py-5 transition hover:bg-zinc-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="text-base font-medium text-zinc-900">
                          {client.name}
                        </p>
                        <span
                          className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
                          style={{ backgroundColor: '#EBF2F9', color: ODPC_BLUE }}
                        >
                          {sectorLabels[client.sector] ?? client.sector}
                        </span>
                      </div>
                      <p className={'mt-1 text-sm font-medium ' + status.certificateColor}>
                        {status.certificateLabel}
                      </p>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      {status.openDsars > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-zinc-400">
                            Requests
                          </p>
                          <p className="mt-1 text-sm font-semibold text-amber-600">
                            {status.openDsars} open
                          </p>
                        </div>
                      )}
                      {status.openBreaches > 0 && (
                        <div>
                          <p className="text-xs uppercase tracking-wider text-zinc-400">
                            Breaches
                          </p>
                          <p className="mt-1 text-sm font-semibold text-red-600">
                            {status.openBreaches} open
                          </p>
                        </div>
                      )}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M9 18l6-6-6-6"
                          stroke="#71717a"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <p className="mt-8 text-center text-xs text-zinc-400">
          Praxis for Firms · Mobi Enterprise Solutions Limited
        </p>
      </main>
    </div>
  );
}