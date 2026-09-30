import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, tenant_id, tenants(name)')
    .eq('id', user.id)
    .single();

  const schoolName = (profile as any)?.tenants?.name ?? 'Your School';

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
            <h1 className="text-2xl font-semibold text-zinc-900">{schoolName}</h1>
            <p className="mt-1 text-sm text-zinc-500">
              ODPC Compliance Dashboard
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="text-sm text-zinc-500 hover:text-zinc-900"
            >
              Sign out
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Certificate status</p>
          <p className="mt-1 text-lg font-medium text-zinc-900">
            Not yet registered
          </p>
          <p className="mt-4 text-sm text-zinc-600">
            Complete your intake form to generate your Form DPR 1 and begin registration.
          </p>
          <button
            disabled
            className="mt-6 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white opacity-50"
          >
            Start intake form (coming next)
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-zinc-200 bg-white p-6">
          <p className="text-sm text-zinc-500">Your account</p>
          <p className="mt-1 text-sm text-zinc-900">{user.email}</p>
        </div>
      </div>
    </div>
  );
}