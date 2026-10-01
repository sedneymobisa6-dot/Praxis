import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function hoursUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60));
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function ProgressRing({
  days,
  total,
  color,
}: {
  days: number;
  total: number;
  color: string;
}) {
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.max(0, Math.min(1, days / total));
  const offset = circumference * (1 - progress);

  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={radius} stroke="#E5E7EB" strokeWidth="10" fill="none" />
      <circle
        cx="70"
        cy="70"
        r={radius}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 70 70)"
      />
      <text x="70" y="66" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0A3D62">
        {days > 0 ? days : 0}
      </text>
      <text x="70" y="86" textAnchor="middle" fontSize="10" fill="#6B7280" letterSpacing="1">
        DAYS LEFT
      </text>
    </svg>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('tenant_id, full_name')
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
    .select('action, created_at, metadata')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: openRequests } = await supabase
    .from('dsar_requests')
    .select('id, requester_name, request_type, deadline_date, status')
    .eq('tenant_id', tenantId)
    .in('status', ['open', 'in_progress'])
    .order('deadline_date', { ascending: true });

  const { data: openBreaches } = await supabase
    .from('breaches')
    .select('id, discovered_at, breach_description, status')
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

  const ODPC_BLUE = '#0A3D62';
  const GREEN = '#16A34A';
  const AMBER = '#D97706';
  const RED = '#DC2626';

  let ringColor = ODPC_BLUE;
  let statusLabel = 'Not yet registered';
  let statusNote = 'Complete your intake form to begin.';
  let statusBg = 'bg-blue-50';
  let statusText = 'text-blue-900';
  let statusDot = 'bg-[#0A3D62]';

  if (days !== null) {
    if (days <= 0) {
      ringColor = RED;
      statusLabel = 'Certificate Expired';
      statusNote = 'You are required to renew immediately.';
      statusBg = 'bg-red-50';
      statusText = 'text-red-900';
      statusDot = 'bg-red-600';
    } else if (days <= 30) {
      ringColor = RED;
      statusLabel = 'Expiring Soon';
      statusNote = 'Renew within 30 days to remain compliant.';
      statusBg = 'bg-red-50';
      statusText = 'text-red-900';
      statusDot = 'bg-red-600';
    } else if (days <= 60) {
      ringColor = AMBER;
      statusLabel = 'Renewal Window Approaching';
      statusNote = 'Begin your renewal within 60 days.';
      statusBg = 'bg-amber-50';
      statusText = 'text-amber-900';
      statusDot = 'bg-amber-600';
    } else {
      ringColor = GREEN;
      statusLabel = 'Active & Compliant';
      statusNote = 'Your certificate is valid. We are monitoring the renewal window.';
      statusBg = 'bg-green-50';
      statusText = 'text-green-900';
      statusDot = 'bg-green-600';
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
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
            <span className="text-base font-semibold text-zinc-900">Praxis</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/requests"
              className="text-sm font-medium"
              style={{ color: ODPC_BLUE }}
            >
              Requests
            </Link>
            <Link
              href="/dashboard/breach"
              className="text-sm font-medium"
              style={{ color: ODPC_BLUE }}
            >
              Breach
            </Link>
            <span className="hidden text-sm text-zinc-500 md:inline">
              {user.email}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            ODPC Compliance
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {school?.school_name ?? 'Your School'}
          </h1>
        </div>

        {!school ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <div
              className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: '#EBF2F9' }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  stroke={ODPC_BLUE}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-zinc-900">
              Begin your ODPC registration
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              Complete the intake form to generate your Form DPR 1 and begin the
              registration process with the Office of the Data Protection
              Commissioner.
            </p>
            <Link
              href="/dashboard/intake"
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Start intake form
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12h14M13 6l6 6-6 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
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
                    <div
                      className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-[10px]"
                      style={{ borderColor: '#E5E7EB' }}
                    >
                      <span className="text-sm text-zinc-400">Pending</span>
                    </div>
                  )}
                </div>

                <div>
                  <div
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusBg}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
                    <span
                      className={`text-xs font-semibold uppercase tracking-wider ${statusText}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                    Certificate of Registration
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">{statusNote}</p>

                  {school.certificate_issued_at && school.certificate_expires_at && (
                    <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Certificate No.
                        </p>
                        <p className="mt-1 font-mono text-sm text-zinc-900">
                          {school.certificate_number || '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Issued
                        </p>
                        <p className="mt-1 text-sm text-zinc-900">
                          {formatDate(school.certificate_issued_at)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                          Expires
                        </p>
                        <p className="mt-1 text-sm text-zinc-900">
                          {formatDate(school.certificate_expires_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50 px-8 py-4">
                <a
                  href="/api/generate-dpr1"
                  className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                  style={{ backgroundColor: ODPC_BLUE }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3v12m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Download Form DPR 1
                </a>
                <Link
                  href="/dashboard/register"
                  className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium transition hover:bg-zinc-100"
                  style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
                >
                  {school.certificate_issued_at
                    ? 'Update certificate'
                    : 'Mark as Registered'}
                </Link>
              </div>
            </div>

            {openBreaches && openBreaches.length > 0 && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-red-700">
                    Open Data Breaches
                  </h3>
                  <Link
                    href="/dashboard/breach"
                    className="text-xs font-medium text-red-700 hover:text-red-900"
                  >
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {openBreaches.slice(0, 3).map((breach) => {
                    const discoveredAt = new Date(breach.discovered_at);
                    const deadline = new Date(discoveredAt.getTime() + 72 * 60 * 60 * 1000);
                    const hoursLeft = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
                    const urgent = hoursLeft <= 24;
                    return (
                      <li key={breach.id}>
                        <Link
                          href={'/dashboard/breach/' + breach.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-white px-4 py-3 transition hover:bg-red-50"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900">
                              Breach reported
                            </p>
                            <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">
                              {breach.breach_description}
                            </p>
                          </div>
                          <span
                            className={
                              'inline-block rounded-full px-2.5 py-1 text-xs font-semibold ' +
                              (hoursLeft <= 0 || urgent
                                ? 'bg-red-100 text-red-700'
                                : 'bg-amber-50 text-amber-700')
                            }
                          >
                            {hoursLeft <= 0
                              ? 'Overdue'
                              : hoursLeft + 'h left'}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {openBreaches.length > 3 && (
                  <Link
                    href="/dashboard/breach"
                    className="mt-4 inline-block text-xs font-medium text-red-700"
                  >
                    + {openBreaches.length - 3} more
                  </Link>
                )}
              </div>
            )}

            {openRequests && openRequests.length > 0 && (
              <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                    Open Data Subject Requests
                  </h3>
                  <Link
                    href="/dashboard/requests"
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    View all
                  </Link>
                </div>
                <ul className="mt-5 space-y-3">
                  {openRequests.slice(0, 3).map((req) => {
                    const reqDays = daysUntil(req.deadline_date);
                    const urgent = reqDays <= 3;
                    return (
                      <li key={req.id}>
                        <Link
                          href={'/dashboard/requests/' + req.id}
                          className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-4 py-3 transition hover:bg-zinc-50"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium text-zinc-900">
                              {req.requester_name}
                            </p>
                            <p className="text-xs capitalize text-zinc-500">
                              {req.request_type} request
                            </p>
                          </div>
                          <span
                            className={
                              'inline-block rounded-full px-2.5 py-1 text-xs font-semibold ' +
                              (urgent
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700')
                            }
                          >
                            {reqDays < 0 ? 'Overdue' : reqDays + ' days'}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {openRequests.length > 3 && (
                  <Link
                    href="/dashboard/requests"
                    className="mt-4 inline-block text-xs font-medium"
                    style={{ color: ODPC_BLUE }}
                  >
                    + {openRequests.length - 3} more
                  </Link>
                )}
              </div>
            )}

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
                    School Profile
                  </h3>
                  <Link
                    href="/dashboard/intake"
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900"
                  >
                    Edit
                  </Link>
                </div>

                <dl className="mt-5 space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <dt className="text-sm text-zinc-500">County</dt>
                    <dd className="text-sm font-medium text-zinc-900">
                      {school.county || '—'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <dt className="text-sm text-zinc-500">Sector</dt>
                    <dd className="text-sm font-medium text-zinc-900">
                      {school.sector || 'Education'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between bord