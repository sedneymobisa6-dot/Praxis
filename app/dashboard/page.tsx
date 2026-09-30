import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

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
              <p className="mt-1 text-lg font-medium text-zinc-900">
                Intake complete - not yet submitted to ODPC
              </p>
              <p className="mt-4 text-sm text-zinc-600">
                Your intake data has been captured. Download Form DPR 1 and submit it to the ODPC portal.
              </p>
              <a
                href="/api/generate-dpr1"
                className="mt-6 inline-block rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
              >
                Download Form DPR 1 (PDF)
              </a>
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