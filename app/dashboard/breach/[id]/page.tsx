import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';
const RED = '#DC2626';

function formatDateTime(dateString: string) {
  return new Date(dateString).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function hoursLeft(discoveredAt: string) {
  const discovered = new Date(discoveredAt);
  const deadline = new Date(discovered.getTime() + 72 * 60 * 60 * 1000);
  return Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60));
}

export default async function BreachDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: breach } = await supabase
    .from('breaches')
    .select('*, schools(school_name, postal_address, telephone, email)')
    .eq('id', params.id)
    .maybeSingle();

  if (!breach) {
    redirect('/dashboard/breach');
  }

  const school = (breach as any).schools;
  const schoolName = school?.school_name ?? 'Your School';

  const hours = hoursLeft(breach.discovered_at);
  const deadline = new Date(new Date(breach.discovered_at).getTime() + 72 * 60 * 60 * 1000);
  const isOverdue = hours <= 0;
  const isUrgent = hours > 0 && hours <= 24;
  const notified = breach.odpc_notified;

  let statusLabel = hours + 'h to notify';
  let statusBg = 'bg-amber-50';
  let statusText = 'text-amber-700';
  let statusDot = 'bg-amber-600';

  if (notified) {
    statusLabel = 'ODPC Notified';
    statusBg = 'bg-green-50';
    statusText = 'text-green-700';
    statusDot = 'bg-green-600';
  } else if (isOverdue) {
    statusLabel = 'Overdue';
    statusBg = 'bg-red-50';
    statusText = 'text-red-700';
    statusDot = 'bg-red-600';
  } else if (isUrgent) {
    statusLabel = hours + 'h left — urgent';
    statusBg = 'bg-red-50';
    statusText = 'text-red-700';
    statusDot = 'bg-red-600';
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
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
            href="/dashboard/breach"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to breaches
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: RED }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: RED }}
          >
            Data Breach Report
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {schoolName}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                Discovered {formatDateTime(breach.discovered_at)}
              </p>
            </div>
            <span
              className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${statusBg}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${statusDot}`} />
              <span className={`text-xs font-semibold uppercase tracking-wider ${statusText}`}>
                {statusLabel}
              </span>
            </span>
          </div>
        </div>

        {/* Countdown card */}
        {!notified && (
          <div className="mb-6 overflow-hidden rounded-2xl border border-red-200 bg-white shadow-sm">
            <div className="h-1 w-full" style={{ backgroundColor: RED }} />
            <div className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Discovered
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {formatDateTime(breach.discovered_at)}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    ODPC Deadline
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">
                    {formatDateTime(deadline.toISOString())}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Legal Window
                  </p>
                  <p className="mt-1 text-sm text-zinc-900">72 hours</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Breach description */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            What Happened
          </h2>
          <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
            {breach.breach_description}
          </p>
        </div>

        {/* Cause */}
        {breach.breach_cause && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Cause
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
              {breach.breach_cause}
            </p>
          </div>
        )}

        {/* Affected data */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Data Affected
          </h2>
          <dl className="mt-5 space-y-3">
            {breach.data_subjects_affected !== null && (
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Data subjects affected</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {breach.data_subjects_affected}
                </dd>
              </div>
            )}
            {breach.data_categories_affected && (
              <div className="border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Categories</dt>
                <dd className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {breach.data_categories_affected}
                </dd>
              </div>
            )}
            {breach.potential_harm && (
              <div>
                <dt className="text-sm text-zinc-500">Potential harm</dt>
                <dd className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">
                  {breach.potential_harm}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* Remediation */}
        {breach.remedial_actions && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Remedial Actions
            </h2>
            <p className="mt-4 whitespace-pre-wrap text-sm text-zinc-700">
              {breach.remedial_actions}
            </p>
          </div>
        )}

        {/* Legal basis */}
        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Legal Basis
          </h2>
          <p className="mt-4 text-sm text-zinc-700">
            Section 43 of the Data Protection Act 2019, read together with
            Regulation 38 of the Data Protection (General) Regulations, 2021
            (Legal Notice 263). A data controller must notify the Office of the
            Data Protection Commissioner within 72 hours of becoming aware of a
            notifiable data breach.
          </p>
        </div>

        {/* Notification letter generator */}
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Notify the ODPC
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Download the formal notification letter. Review it, sign it, and
            submit it to the Office of the Data Protection Commissioner before
            the 72-hour deadline.
          </p>
          <a
            href={'/api/generate-breach-notice/' + breach.id}
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: RED }}
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
            Download notification letter
          </a>
        </div>
      </main>
    </div>
  );
}