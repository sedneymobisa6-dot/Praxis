import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { SECTOR_LABELS } from '@/lib/sectors';
import BrandLogo from '@/components/BrandLogo';
import DashboardLower from './DashboardLower';

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

function shortSector(code: string) {
  const full = SECTOR_LABELS[code];
  if (!full) return code;
  const idx = full.indexOf('(');
  if (idx === -1) return full;
  return full.substring(0, idx).trim();
}

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

  const { data: firmUser } = await supabase
    .from('firm_users')
    .select('role, firms(account_type)')
    .eq('user_id', user.id)
    .order('is_active', { ascending: false })
    .limit(1)
    .maybeSingle();

  const isLead = firmUser?.role === 'lead';
  const isFirm = (firmUser as any)?.firms?.account_type === 'firm';

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
    .is('superseded_at', null)
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

  const { data: dpias } = await supabase
    .from('client_dpias')
    .select('id, project_name, created_at')
    .eq('client_id', client.id)
    .order('created_at', { ascending: false });

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
          <Link href={isFirm ? "/firm/dashboard" : "#"}>
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <div className="flex items-center gap-3 sm:gap-4">
            {isLead && (
              <Link
                href="/firm/team"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                Manage Team
              </Link>
            )}
            
            {isFirm && (
              <Link
                href="/firm/dashboard"
                className="text-sm text-zinc-500 hover:text-zinc-900"
              >
                All clients
              </Link>
            )}

            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 whitespace-nowrap"
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
          <div className="flex items-center gap-3 flex-wrap">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: ODPC_BLUE }}
            >
              Client
            </p>
            <span
              className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap"
              style={{ backgroundColor: '#EBF2F9', color: ODPC_BLUE }}
            >
              {shortSector(client.sector)}
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

        <DashboardLower
          clientId={client.id}
          clientName={client.name}
          dpiasCount={dpias?.length ?? 0}
          openBreaches={openBreaches ?? []}
          openRequests={openRequests ?? []}
          recentActivity={recentActivity ?? []}
          isLead={isLead}
          isFirm={isFirm}
        />

        <p className="mt-8 text-center text-xs text-zinc-400 pb-10">Praxis</p>
      </main>
    </div>
  );
}