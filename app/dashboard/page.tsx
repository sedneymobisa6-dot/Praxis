import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ProgressRing } from './ProgressRing';
import { ODPC_BLUE, GREEN, AMBER, RED, daysUntil, formatDate } from './statusHelpers';

export default async function DashboardPage() {
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

  const { data: school } = await supabase
    .from('schools')
    .select('*')
    .eq('tenant_id', tenantId)
    .maybeSingle();

  const { data: recentActivity } = await supabase
    .from('audit_log')
    .select('action, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: openRequests } = await supabase
    .from('dsar_requests')
    .select('id, requester_name, request_type, deadline_date')
    .eq('tenant_id', tenantId)
    .in('status', ['open', 'in_progress'])
    .order('deadline_date', { ascending: true });

  const { data: openBreaches } = await supabase
    .from('breaches')
    .select('id, discovered_at, breach_description')
    .eq('tenant_id', tenantId)
    .in('status', ['open', 'investigating', 'notified'])
    .order('discovered_at', { ascending: false });

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  const days = school?.certificate_expires_at
    ? daysUntil(school.certificate_expires_at)
    : null;

  let ringColor = ODPC_BLUE;
  let statusLabel = 'Not yet registered';
  let statusNote = 'Complete your intake form to begin.';

  if (days !== null) {
    if (days <= 0) {
      ringColor = RED;
      statusLabel = 'Certificate Expired';
      statusNote = 'You are required to renew immediately.';
    } else if (days <= 30) {
      ringColor = RED;
      statusLabel = 'Expiring Soon';
      statusNote = 'Renew within 30 days to remain compliant.';
    } else if (days <= 60) {
      ringColor = AMBER;
      statusLabel = 'Renewal Window Approaching';
      statusNote = 'Begin your renewal within 60 days.';
    } else {
      ringColor = GREEN;
      statusLabel = 'Active and Compliant';
      statusNote = 'Your certificate is valid. We are monitoring the renewal window.';
    }
  }

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
          <div className="flex items-center gap-4">
            <Link href="/dashboard/requests" className="text-sm font-medium" style={{ color: ODPC_BLUE }}>
              Requests
            </Link>
            <Link href="/dashboard/breach" className="text-sm font-medium" style={{ color: ODPC_BLUE }}>
              Breach
            </Link>
            <form action={signOut}>
              <button type="submit" className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700">
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: ODPC_BLUE }}>
            ODPC Compliance
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {school?.school_name ?? 'Your School'}
          </h1>
        </div>

        {!school ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-zinc-900">Begin your ODPC registration</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Complete the intake form to generate your Form DPR 1 and begin registration.
            </p>
            <Link
              href="/dashboard/intake"
              className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Start intake form
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="h-1 w-full" style={{ backgroundColor: ODPC_BLUE }} />
              <div className="grid gap-8 p-8 md:grid-cols-[auto_1fr] md:items-center">
                <div className="flex justify-center">
                  {days !== null ? (
                    <ProgressRing days={days} total={730} color={ringColor} />
                  ) : (
                    <div className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-[10px] border-zinc-200">
                      <span className="text-sm text-zinc-400">Pending</span>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ringColor }}>
                    {statusLabel}
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                    Certificate of Registration
                  </h2>
                  <p className="mt-2 text-sm text-zinc-500">{statusNote}</p>
                  {school.certificate_issued_at && school.certificate_expires_at && (
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Certificate No.</p>
                        <p className="mt-1 font-mono text-sm text-zinc-900">{school.certificate_number || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Issued</p>
                        <p className="mt-1 text-sm text-zinc-900">{formatDate(school.certificate_issued_at)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Expires</p>
                        <p className="mt-1 text-sm text-zinc-900">{formatDate(school.certificate_expires_at)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50 px-8 py-4">
                <a
                  href="/api/generate-dpr1"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                  style={{ backgroundColor: ODPC_BLUE }}
                >
                  Download Form DPR 1
                </a>
                <Link
                  href="/dashboard/register"
                  className="rounded-lg border bg-white px-4 py-2 text-sm font-medium"
                  style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
                >
                  {school.certificate_issued_at ? 'Update certificate' : 'Mark as Registered'}
                </Link>
              </div>
            </div>

            {openBreaches && openBreaches.length > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-red-700">Open Data Breaches</h3>
                  <Link href="/dashboard/breach" className="text-xs font-medium text-red-700">
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {openBreaches.slice(0, 3).map((breach) => {
                    const discovered = new Date(breach.discovered_at);
                    const deadline = new Date(discovered.getTime() + 72 * 60 * 60 * 1000);
                    const hours = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
                    return (
                      <li key={breach.id}>
                        <Link
                          href={'/dashboard/breach/' + breach.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-white px-4 py-3"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900">Breach reported</p>
                            <p className="mt-0.5 text-xs text-zinc-500">{breach.breach_description}</p>
                          </div>
                          <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700">
                            {hours <= 0 ? 'Overdue' : hours + 'h left'}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {openRequests && openRequests.length > 0 && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                    Open Data Subject Requests
                  </h3>
                  <Link href="/dashboard/requests" className="text-xs font-medium text-zinc-500">
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {openRequests.slice(0, 3).map((req) => {
                    const reqDays = daysUntil(req.deadline_date);
                    return (
                      <li key={req.id}>
                        <Link
                          href={'/dashboard/requests/' + req.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-4 py-3"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900">{req.requester_name}</p>
                            <p className="text-xs capitalize text-zinc-500">{req.request_type} request</p>
                          </div>
                          <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            {reqDays < 0 ? 'Overdue' : reqDays + ' days'}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                  Privacy Notice
                </h3>
                <Link
                  href="/dashboard/privacy"
                  className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                >
                  View
                </Link>
              </div>
              <p className="mt-3 text-sm text-zinc-600">
                Every school must publish a privacy notice explaining what data
                it collects and why. Praxis generates one from your intake data.
              </p>
              <Link
                href="/dashboard/privacy"
                className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: ODPC_BLUE }}
              >
                Generate privacy notice
              </Link>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                    School Profile
                  </h3>
                  <Link href="/dashboard/intake" className="text-xs font-medium text-zinc-500">
                    Edit
                  </Link>
                </div>
                <dl className="mt-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <dt className="text-sm text-zinc-500">County</dt>
                    <dd className="text-sm font-medium text-zinc-900">{school.county || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <dt className="text-sm text-zinc-500">Sector</dt>
                    <dd className="text-sm font-medium text-zinc-900">{school.sector || 'Education'}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <dt className="text-sm text-zinc-500">Employees</dt>
                    <dd className="text-sm font-medium text-zinc-900">{school.employee_count || '-'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-sm text-zinc-500">Annual Turnover</dt>
                    <dd className="text-sm font-medium text-zinc-900">{school.turnover_range || '-'}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                  Recent Activity
                </h3>
                {recentActivity && recentActivity.length > 0 ? (
                  <ul className="mt-5 space-y-4">
                    {recentActivity.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full" style={{ backgroundColor: ODPC_BLUE }} />
                        <div className="flex-1">
                          <p className="text-sm capitalize text-zinc-900">
                            {String(item.action).replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-zinc-400">
                            {new Date(item.created_at).toLocaleString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-5 text-sm text-zinc-400">No activity yet.</p>
                )}
              </div>
            </div>

            <p className="mt-8 text-center text-xs text-zinc-400">
              Praxis maintains a 24-month renewal watch on your certificate.
            </p>
          </>
        )}
      </main>
    </div>
  );
}