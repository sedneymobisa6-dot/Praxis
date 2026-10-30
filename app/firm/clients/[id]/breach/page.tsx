import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default async function ClientBreachesPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/firm/login');
  }

  const { data: client } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', params.id)
    .maybeSingle();

  if (!client) {
    redirect('/firm/dashboard');
  }

  const { data: breaches } = await supabase
    .from('client_breaches')
    .select('*')
    .eq('client_id', params.id)
    .order('discovered_at', { ascending: false });

  const openBreaches = (breaches ?? []).filter(
    (b) => b.status === 'open' || b.status === 'investigating' || b.status === 'notified'
  );
  const closedBreaches = (breaches ?? []).filter(
    (b) => b.status === 'closed' || b.status === 'resolved'
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + params.id} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <Link
            href={'/firm/clients/' + params.id}
            className="text-sm text-zinc-500"
          >
            Back to client
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: ODPC_BLUE }}
            >
              {client.name}
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Data Breaches
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              The ODPC must be notified within 72 hours of becoming aware of a breach.
            </p>
          </div>
          <Link
            href={'/firm/clients/' + params.id + '/breach/new'}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Report a breach
          </Link>
        </div>

        {openBreaches.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Open Breaches ({openBreaches.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {openBreaches.map((breach, i) => (
                <Link
                  key={breach.id}
                  href={'/firm/clients/' + params.id + '/breach/' + breach.id}
                  className={
                    'block px-6 py-4 transition hover:bg-zinc-50 ' +
                    (i > 0 ? 'border-t border-zinc-100' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        Discovered {formatDateTime(breach.discovered_at)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {breach.breach_description}
                      </p>
                    </div>
                    <span
                      className={
                        'inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' +
                        (breach.odpc_notified
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700')
                      }
                    >
                      {breach.odpc_notified ? 'Notified' : 'Action Required'}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {openBreaches.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">No open breaches</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Report a breach immediately if patient data is accessed, lost, or disclosed without authorization.
            </p>
            <Link
              href={'/firm/clients/' + params.id + '/breach/new'}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Report the first breach
            </Link>
          </div>
        )}

        {closedBreaches.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Closed Breaches ({closedBreaches.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {closedBreaches.map((breach, i) => (
                <Link
                  key={breach.id}
                  href={'/firm/clients/' + params.id + '/breach/' + breach.id}
                  className={
                    'block px-6 py-4 transition hover:bg-zinc-50 ' +
                    (i > 0 ? 'border-t border-zinc-100' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        Discovered {formatDateTime(breach.discovered_at)}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-zinc-500">
                        {breach.breach_description}
                      </p>
                    </div>
                    <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-600">
                      {breach.status.replace('_', ' ')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}