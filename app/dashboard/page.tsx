import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

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

  async function signOut() {
    'use server';
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect('/login');
  }

  const days = school?.certificate_expires_at
    ? daysUntil(school.certificate_expires_at)
    : null;

  let statusLabel = 'Not yet registered';
  let statusColor = 'text-zinc-900';

  if (days !== null) {
    if (days <= 0) {
      statusLabel = 'Certificate EXPIRED';
      statusColor = 'text-red-700';
    } else if (days <= 30) {
      statusLabel = 'Expiring in ' + days + ' days';
      statusColor = 'text-red-700';
    } else if (days <= 60) {
      statusLabel = 'Expiring in ' + days + ' days';
      statusColor = 'text-amber-700';
    } else {
      statusLabel = 'Active - ' + days + ' days to renewal';
      statusColor = 'text-green-700';
    }
  }

  return (
    <div className="container-narrow">
      <div className="mt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900">
              {school?.school_name ?? 'Your School'}
            </h1>
            <p className="mt-1 text-sm text-zinc-500">ODPC Compliance Dashboard</p>
          </div>
          <form action={signOut}>
            <button type="submit" className="text-sm text-zinc-500 hover:text-zinc-900">
              Sign out
            </button>
          </form>
        </div>

        {!school ? (
          <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
            <p className="text-sm text-zinc-500">Certificate status</p>
            <p className="mt-1 text-lg font-medium text-zinc-900">Not yet registered</p>
            <p className="mt-4 text-sm text-zinc-600">
              Complete your intake form to generate your Form DPR 1 and begin registration.
            </p>
            <Link
              href="/dashboard/intake"
              className="mt-6 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Start intake form
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
              <p className="text-sm text-zinc-500">Certificate status</p>
              <p className={'mt-1 text-lg font-medium ' + statusColor}>{statusLabel}</p>

              {school.certificate_issued_at && school.certificate_expires_at && (
                <div className="mt-4 space-y-1 text-sm text-zinc-600">
                  <p>
                    <span className="text-zinc-500">Certificate number:</span>{' '}
                    {school.certificate_number || '-'}
                  </p>
                  <p>
                    <span className="text-zinc-500">Issued:</span>{' '}
                    {new Date(school.certificate_issued_at).toLocaleDateString('en-GB')}
                  </p>
                  <p>
                    <span className="text-zinc-500">Expires:</span>{' '}
                    {new Date(school.certificate_expires_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              )}

              {!school.certificate_issued_at && (
                <>
                  <p className="mt-4 text-sm text-zinc-600">
                    Your intake is complete. Download Form DPR 1, submit it to the ODPC portal,
                    then come back and record your certificate details.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="/api/generate-dpr1"
                      className="inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                    >
                      Download Form DPR 1 (PDF)
                    </a>
                    <Link
                      href="/dashboard/register"
                      className="inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                    >
                      Mark as Registered
                    </Link>
                  </div>
                </>
              )}

              {school.certificate_issued_at && (
                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href="/api/generate-dpr1"
                    className="inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Download Form DPR 1
                  </a>
                  <Link
                    href="/dashboard/register"
                    className="inline-block rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
                  >
                    Update certificate details
                  </Link>
                </div>
              )}
            </div>

            <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
              <p className="text-sm text-zinc-500">School details on file</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-900">
                <p>
                  <span className="text-zinc-500">County:</span> {school.county || '-'}
                </p>
                <p>
                  <span className="text-zinc-500">Employees:</span> {school.employee_count || '-'}
                </p>
                <p>
                  <span className="text-zinc-500">Turnover:</span> {school.turnover_range || '-'}
                </p>
              </div>
              <Link
                href="/dashboard/intake"
                className="mt-4 inline-block text-sm text-brand-600 hover:text-brand-700"
              >
                Update details
              </Link>
            </div>
          </>
        )}

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Your account</p>
          <p className="mt-1 text-sm text-zinc-900">{user.email}</p>
        </div>
      </div>
    </div>
  );
}