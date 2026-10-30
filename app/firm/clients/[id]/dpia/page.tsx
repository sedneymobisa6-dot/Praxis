import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default async function DpiaListPage({
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

  const { data: dpias } = await supabase
    .from('client_dpias')
    .select('*')
    .eq('client_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + params.id} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
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
              Data Protection Impact Assessments
            </h1>
            <p className="mt-1 text-sm text-zinc-500">
              Track DPIAs for high risk processing activities.
            </p>
          </div>
          <Link
            href={'/firm/clients/' + params.id + '/dpia/new'}
            className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            + New DPIA
          </Link>
        </div>

        {!dpias || dpias.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">No DPIAs recorded</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              A DPIA is required before deploying any system that poses a high risk to data subjects, such as a new patient portal, CCTV system, or biometric database.
            </p>
            <Link
              href={'/firm/clients/' + params.id + '/dpia/new'}
              className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Start the first DPIA
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
            {dpias.map((dpia, i) => (
              <Link
                key={dpia.id}
                href={'/firm/clients/' + params.id + '/dpia/' + dpia.id}
                className={
                  'block px-6 py-5 transition hover:bg-zinc-50 ' +
                  (i > 0 ? 'border-t border-zinc-100' : '')
                }
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-base font-medium text-zinc-900">
                      {dpia.project_name}
                    </p>
                    <p className="mt-1 text-sm text-zinc-500 line-clamp-1">
                      {dpia.project_outline}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span
                      className={
                        'inline-block rounded-full px-2.5 py-1 text-xs font-semibold capitalize ' +
                        (dpia.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700')
                      }
                    >
                      {dpia.status}
                    </span>
                    <p className="mt-2 text-xs text-zinc-400">
                      Created {formatDate(dpia.created_at)}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}