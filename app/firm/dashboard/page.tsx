import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTOR_LABELS } from '@/lib/sectors';
import SearchBar from './SearchBar';

const ODPC_BLUE = '#0A3D62';

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

type Props = {
  searchParams: { q?: string; sector?: string };
};

export default async function FirmDashboardPage(props: Props) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/firm/login');
  }

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('firm_id, full_name, firms(id, name, subscription_status)')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!firmUser) {
    redirect('/firm/login');
  }

  const firmId = firmUser.firm_id;
  const firm = (firmUser as any).firms;
  const firmName = firm?.name ?? 'Your Firm';

  const query = (props.searchParams.q ?? '').trim();
  const sectorFilter = (props.searchParams.sector ?? '').trim();

  let clientsQuery = supabase
    .from('clients')
    .select('id, name, sector, created_at')
    .eq('firm_id', firmId);

  if (query) {
    clientsQuery = clientsQuery.ilike('name', '%' + query + '%');
  }

  if (sectorFilter) {
    clientsQuery = clientsQuery.eq('sector', sectorFilter);
  }

  const { data: clients } = await clientsQuery.order('created_at', { ascending: false });

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
        certificateLabel = 'Active - ' + days + ' days';
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
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700"
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
        <div className="mb-6">
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
            {clients?.length ?? 0} {(clients?.length === 1) ? 'client' : 'clients'} shown
          </p>
        </div>

        <div className="mb-6">
          <SearchBar initialQuery={query} initialSector={sectorFilter} />
        </div>

        {!clients || clients.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-12 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">
              {query || sectorFilter ? 'No matching clients' : 'No clients yet'}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              {query || sectorFilter
                ? 'Try a different search term or filter.'
                : 'Add your first client to start managing their ODPC compliance.'}
            </p>
            {!query && !sectorFilter && (
              <Link
                href="/firm/clients/new"
                className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
                style={{ backgroundColor: ODPC_BLUE }}
              >
                Add your first client
              </Link>
            )}
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
                          {SECTOR_LABELS[client.sector] ?? client.sector}
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

        <div className="mt-8 flex items-center justify-between">
          <Link
            href="/firm/clients/new"
            className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            + Add a client
          </Link>
          <p className="text-xs text-zinc-400">
            Praxis for Firms - Mobi Enterprise Solutions Limited
          </p>
        </div>
      </main>
    </div>
  );
}