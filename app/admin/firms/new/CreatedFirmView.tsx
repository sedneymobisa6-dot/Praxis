'use client';

import Link from 'next/link';

const ODPC_BLUE = '#0A3D62';

type CreatedFirmProps = {
  created: {
    firmId: string;
    firmName: string;
    ownerEmail: string;
    ownerPassword: string;
    accountType: string;
  };
  onReset: () => void;
};

export default function CreatedFirmView({ created, onReset }: CreatedFirmProps) {
  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/admin" className="flex items-center gap-3">
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
            <span className="text-base font-semibold text-zinc-900">
              Praxis Admin
            </span>
          </Link>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to firms
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <h1 className="text-2xl font-semibold text-green-900">
            Firm created successfully
          </h1>
          <p className="mt-2 text-sm text-green-800">
            Share these credentials with the owner. They will be forced to
            change the password on first login.
          </p>
        </div>

        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Login credentials
          </h2>

          <dl className="mt-5 space-y-4">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Firm
              </dt>
              <dd className="mt-1 text-sm text-zinc-900">{created.firmName}</dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Account type
              </dt>
              <dd className="mt-1 text-sm capitalize text-zinc-900">
                {created.accountType}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email
              </dt>
              <dd className="mt-1 font-mono text-sm text-zinc-900">
                {created.ownerEmail}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Temporary password
              </dt>
              <dd className="mt-1 font-mono text-sm text-zinc-900">
                {created.ownerPassword}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-xs text-amber-800">
              Copy these credentials now. Once you leave this page, the password
              will not be shown again.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Link
            href={'/admin/firms/' + created.firmId}
            className="rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            View firm details
          </Link>
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700"
          >
            Create another firm
          </button>
          <Link
            href="/admin"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Back to all firms
          </Link>
        </div>
      </main>
    </div>
  );
}