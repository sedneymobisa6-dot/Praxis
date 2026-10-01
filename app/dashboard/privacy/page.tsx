import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

const ODPC_BLUE = '#0A3D62';

export default async function PrivacyPage() {
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

  if (!school) {
    redirect('/dashboard/intake');
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
            href="/dashboard"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to dashboard
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            Privacy Notice
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Privacy Notice Generator
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Generate a privacy notice tailored to your school based on the data
            you provided in your intake form.
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            What Your Privacy Notice Will Include
          </h2>
          <ul className="mt-5 space-y-3">
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                The specific categories of personal data your school collects
              </p>
            </li>
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                The purposes for which each category is processed
              </p>
            </li>
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                Any cross-border transfers and the countries involved
              </p>
            </li>
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                Your security measures for protecting personal data
              </p>
            </li>
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                Child-specific clauses required by the ODPC for educational
                institutions
              </p>
            </li>
            <li className="flex gap-3">
              <div
                className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: '#EBF2F9' }}
              >
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M5 13l4 4L19 7"
                    stroke={ODPC_BLUE}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="text-sm text-zinc-700">
                How data subjects can exercise their rights under the Data
                Protection Act
              </p>
            </li>
          </ul>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            School Details on File
          </h2>
          <dl className="mt-5 space-y-3">
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-500">School</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {school.school_name}
              </dd>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-500">Email</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {school.email || '-'}
              </dd>
            </div>
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-500">County</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {school.county || '-'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-zinc-500">Telephone</dt>
              <dd className="text-sm font-medium text-zinc-900">
                {school.telephone || '-'}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Download
          </h2>
          <p className="mt-3 text-sm text-zinc-600">
            Download the privacy notice as a document you can publish on your
            school website or share with parents and guardians.
          </p>
          <a
            href="/api/generate-privacy-notice"
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
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
            Download privacy notice
          </a>
        </div>

        <p className="mt-8 text-center text-xs text-zinc-400">
          This notice is generated from your intake data. Update the intake form
          to change any of the details.
        </p>
      </main>
    </div>
  );
}