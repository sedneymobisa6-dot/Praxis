import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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

function hoursUntil72(discoveredAt: string) {
  const discovered = new Date(discoveredAt);
  const deadline = new Date(discovered.getTime() + 72 * 60 * 60 * 1000);
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
}

export default async function BreachListPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id')
    .eq('id', user.id)
    .single();

  const tenantId = (profile as any)?.tenant_id;

  const { data: breaches } = await supabase
    .from('breaches')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('discovered_at', { ascending: false });

  const open = (breaches ?? []).filter(
    (b) => b.status !== 'closed'
  );
  const closed = (breaches ?? []).filter((b) => b.status === 'closed');

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
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
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: ODPC_BLUE }}
            >
              Data Breach Notifications
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
              Breaches
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              The ODPC must be notified within 72 hours of becoming aware of a
              notifiable breach.
            </p>
          </div>
          <Link
            href="/dashboard/breach/new"
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Report a breach
          </Link>
        </div>

        {open.length > 0 && (
          <div className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Open Breaches ({open.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
              {open.map((breach, i) => {
                const hours = hoursUntil72(breach.discovered_at);
                const overdue = hours <= 0;
                const urgent = hours > 0 && hours <= 24;
                return (
                  <Link
                    key={breach.id}
                    href={'/dashboard/breach/' + breach.id}
                    className={`block px-6 py-4 transition hover:bg-red-50 ${i > 0 ? 'border-t border-red-100' : ''}`}
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
                      <div className="text-right">
                        {breach.odpc_notified ? (
                          <span className="inline-block rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            Notified
                          </span>
                        ) : overdue ? (
                          <span className="inline-block rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            Overdue
                          </span>
                        ) : urgent ? (
                          <span className="inline-block rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700">
                            {hours}h to notify
                          </span>
                        ) : (
                          <span className="inline-block rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            {hours}h to notify
                          </span>
                        )}
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
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#EBF2F9' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 9v2m0 4h.01M5.07 19h13.86a2 2 0 001.74-3l-6.93-12a2 2 0 00-3.48 0L2.33 16a2 2 0 001.74 3z"
                  stroke={ODPC_BLUE}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-zinc-900">
              No open breaches
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              If your school suffers a data breach — a stolen laptop, a hacked
              email, a leaked record — you must notify the ODPC within 72 hours.
              Log it here and the system generates the notification.
            </p>
            <Link
              href="/dashboard/breach/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Report a breach
            </Link>
          </div>
        )}

        {closed.length > 0 && (
          <div className="mt-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
              Closed Breaches ({closed.length})
            </h2>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              {closed.map((breach, i) => (
                <Link
                  key={breach.id}
                  href={'/dashboard/breach/' + breach.id}
                  className={`block px-6 py-4 transition hover:bg-zinc-50 ${i > 0 ? 'border-t border-zinc-100' : ''}`}
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
                    <div className="text-right">
                      <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-600">
                        Closed
                      </span>
                    </div>
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