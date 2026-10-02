import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

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

const typeLabels: Record<string, string> = {
  access: 'Right of Access',
  rectification: 'Right to Rectification',
  erasure: 'Right to Erasure',
  portability: 'Right to Portability',
  restriction: 'Right to Restriction',
  objection: 'Right to Object',
};

export default async function ClientRequestsPage({
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

  const { data: requests } = await supabase
    .from('client_dsar_requests')
    .select('*')
    .eq('client_id', params.id)
    .order('date_received', { ascending: false });

  const open = (requests ?? []).filter(
    (r) => r.status === 'open' || r.status === 'in_progress'
  );
  const closed = (requests ?? []).filter(
    (r) => r.status !== 'open' && r.status !== 'in_progress'
  );

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + params.id} className="flex items-center gap-3">
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
              Data Subject Requests
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track and respond to requests from data subjects.
            </p>
          </div>
          <Link
            href={'/firm/clients/' + params.id + '/requests/new'}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Log a request
          </Link>
        </div>

        {open.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Open Requests ({open.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {open.map((req, i) => {
                const days = daysUntil(req.deadline_date);
                const urgent = days <= 3;
                const overdue = days < 0;
                return (
                  <Link
                    key={req.id}
                    href={'/firm/clients/' + params.id + '/requests/' + req.id}
                    className={
                      'block px-6 py-4 transition hover:bg-zinc-50 ' +
                      (i > 0 ? 'border-t border-zinc-100' : '')
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">
                          {req.requester_name}
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {typeLabels[req.request_type] ?? req.request_type}
                        </p>
                      </div>
                      <div className="text-right">
                        {overdue ? (
                          <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Overdue
                          </span>
                        ) : urgent ? (
                          <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            {days} days left
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            {days} days left
                          </span>
                        )}
                        <p className="mt-1.5 text-xs text-zinc-400">
                          Due {formatDate(req.deadline_date)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {open.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">No open requests</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Log a request when a data subject asks for access, correction,
              deletion, or any other right under the Act.
            </p>
            <Link
              href={'/firm/clients/' + params.id + '/requests/new'}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Log the first request
            </Link>
          </div>
        )}

        {closed.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Closed Requests ({closed.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {closed.map((req, i) => (
                <Link
                  key={req.id}
                  href={'/firm/clients/' + params.id + '/requests/' + req.id}
                  className={
                    'block px-6 py-4 transition hover:bg-zinc-50 ' +
                    (i > 0 ? 'border-t border-zinc-100' : '')
                  }
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {req.requester_name}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {typeLabels[req.request_type] ?? req.request_type}
                      </p>
                    </div>
                    <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold capitalize text-zinc-600">
                      {req.status.replace('_', ' ')}
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