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
  healthcare: 'Healthcare',
  financial_services: 'Financial Services',
  sacco: 'SACCO',
  insurance: 'Insurance',
  debt_collection: 'Debt Collection',
  public_bodies: 'Public Bodies',
  hospitality: 'Hospitality',
  property: 'Property',
  security_cctv: 'Security / CCTV',
  faith: 'Faith Organisation',
  direct_marketing: 'Direct Marketing',
  transport: 'Transport',
  telecom: 'Telecommunications',
  gaming: 'Gaming / Betting',
  genetic_data: 'Genetic Data',
  other: 'Other',
};

const sectorEntityLabels: Record<string, string> = {
  education: 'School',
  healthcare: 'Facility',
  financial_services: 'Institution',
  sacco: 'SACCO',
  insurance: 'Insurer',
  debt_collection: 'Institution',
  public_bodies: 'Public Body',
  hospitality: 'Establishment',
  property: 'Agency',
  security_cctv: 'Provider',
  faith: 'Organisation',
  direct_marketing: 'Business',
  transport: 'Operator',
  telecom: 'Provider',
  gaming: 'Operator',
  genetic_data: 'Processor',
  other: 'Client',
};

export default async function ClientDashboardPage({
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
    .select('*')
    .eq('id', params.id)
    .maybeSingle();

  if (!client) {
    redirect('/firm/dashboard');
  }

  const { data: certificate } = await supabase
    .from('client_certificates')
    .select('*')
    .eq('client_id', client.id)
    .maybeSingle();

  const { data: openRequests } = await supabase
    .from('client_dsar_requests')
    .select('id, requester_name, request_type, deadline_date, status')
    .eq('client_id', client.id)
    .in('status', ['open', 'in_progress'])
    .order('deadline_date', { ascending: true });

  const { data: openBreaches } = await supabase
    .from('client_breaches')
    .select('id, discovered_at, breach_description, status')
    .eq('client_id', client.id)
    .in('status', ['open', 'investigating', 'notified'])
    .order('discovered_at', { ascending: false });

  const { data: recentActivity } = await supabase
    .from('audit_log')
    .select('action, created_at')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const { data: activities } = await supabase
    .from('client_processing_activities')
    .select('id')
    .eq('client_id', client.id);

  const hasIntake = activities && activities.length > 0;

  const days = certificate?.expires_at
    ? daysUntil(certificate.expires_at)
    : null;

  let ringColor = ODPC_BLUE;
  let statusLabel = 'Not yet registered';
  let statusNote = 'Complete the intake form to begin.';

  if (days !== null) {
    if (days <= 0) {
      ringColor = RED;
      statusLabel = 'Certificate Expired';
      statusNote = 'Renew immediately.';
    } else if (days <= 30) {
      ringColor = RED;
      statusLabel = 'Expiring Soon';
      statusNote = 'Renew within 30 days.';
    } else if (days <= 60) {
      ringColor = AMBER;
      statusLabel = 'Renewal Approaching';
      statusNote = 'Begin renewal within 60 days.';
    } else {
      ringColor = GREEN;
      statusLabel = 'Active and Compliant';
      statusNote = 'Certificate is valid. Renewal is monitored.';
    }
  }

  const entityLabel = sectorEntityLabels[client.sector] ?? 'Client';

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/firm/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/firm/dashboard" className="flex items-center gap-3">
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
            <Link
              href="/firm/dashboard"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              All clients
            </Link>
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

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-3">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: ODPC_BLUE }}
            >
              {entityLabel}
            </p>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#EBF2F9', color: ODPC_BLUE }}
            >
              {sectorLabels[client.sector] ?? client.sector}
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            {client.name}
          </h1>
          {client.contact_name && (
            <p className="mt-1 text-sm text-zinc-500">
              Contact: {client.contact_name}
              {client.contact_email ? ' | ' + client.contact_email : ''}
            </p>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="h-1 w-full" style={{ backgroundColor: ringColor }} />
          <div className="grid gap-6 p-8 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex justify-center">
              {days !== null ? (
                <div
                  className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-[10px]"
                  style={{ borderColor: ringColor }}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: ODPC_BLUE }}>
                      {days > 0 ? days : 0}
                    </p>
                    <p className="text-xs uppercase tracking-wider text-zinc-500">
                      Days left
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-[140px] w-[140px] items-center justify-center rounded-full border-[10px] border-zinc-200">
                  <span className="text-sm text-zinc-400">Pending</span>
                </div>
              )}
            </div>

            <div>
              <p
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: ringColor }}
              >
                {statusLabel}
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
                Certificate of Registration
              </h2>
              <p className="mt-2 text-sm text-zinc-500">{statusNote}</p>

              {certificate?.issued_at && certificate?.expires_at && (
                <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-100 pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Certificate No.
                    </p>
                    <p className="mt-1 font-mono text-sm text-zinc-900">
                      {certificate.certificate_number || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Issued
                    </p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {formatDate(certificate.issued_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Expires
                    </p>
                    <p className="mt-1 text-sm text-zinc-900">
                      {formatDate(certificate.expires_at)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-zinc-100 bg-zinc-50 px-8 py-4">
            <Link
              href={'/firm/clients/' + client.id + '/intake'}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {hasIntake ? 'Edit intake form' : 'Complete intake form'}
            </Link>
            <Link
              href={'/firm/clients/' + client.id + '/certificate'}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-medium"
              style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
            >
              {certificate ? 'Update certificate' : 'Mark as Registered'}
            </Link>
            <a
              href={'/api/firm/generate-dpr1/' + client.id}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
            >
              Download Form DPR 1
            </a>
          </div>
        </div>

        {openBreaches && openBreaches.length > 0 && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-700">
                Open Data Breaches
              </h3>
              <Link
                href={'/firm/clients/' + client.id + '/breach'}
                className="text-xs font-medium text-red-700"
              >
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
                      href={'/firm/clients/' + client.id + '/breach/' + breach.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-red-100 bg-white px-4 py-3"
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-900">
                          Breach reported
                        </p>
                        <p className="mt-0.5 text-xs text-zinc-500">
                          {breach.breach_description}
                        </p>
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
              <Link
                href={'/firm/clients/' + client.id + '/requests'}
                className="text-xs font-medium text-zinc-500"
              >
                View all
              </Link>
            </div>
            <ul className="mt-5 space-y-3">
              {openRequests.slice(0, 3).map((req) => {
                const reqDays = daysUntil(req.deadline_date);
                return (
                  <li key={req.id}>
                    <Link
                      href={'/firm/clients/' + client.id + '/requests/' + req.id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-zinc-100 px-4 py-3"
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
                          'rounded-full px-2.5 py-1 text-xs font-semibold ' +
                          (reqDays <= 3
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
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Client Actions
            </h3>
            <div className="mt-5 space-y-2">
              <Link
                href={'/firm/clients/' + client.id + '/requests/new'}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                <span>Log a data subject request</span>
                <span className="text-zinc-400">-&gt;</span>
              </Link>
              <Link
                href={'/firm/clients/' + client.id + '/breach/new'}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                <span>Report a data breach</span>
                <span className="text-zinc-400">-&gt;</span>
              </Link>
              <a
                href={'/api/firm/generate-privacy-notice/' + client.id + '?format=word'}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                <span>Download privacy notice (Word)</span>
                <span className="text-zinc-400">-&gt;</span>
              </a>
              <a
                href={'/api/firm/generate-audit-log/' + client.id}
                className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
              >
                <span>Download audit log</span>
                <span className="text-zinc-400">-&gt;</span>
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Recent Activity
            </h3>
            {recentActivity && recentActivity.length > 0 ? (
              <ul className="mt-5 space-y-4">
                {recentActivity.map((item, i) => (
                  <li key={i} className="flex gap-3">
                    <div
                      className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full"
                      style={{ backgroundColor: ODPC_BLUE }}
                    />
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
          Praxis for Firms | Mobi Enterprise Solutions Limited
        </p>
      </main>
    </div>
  );
}