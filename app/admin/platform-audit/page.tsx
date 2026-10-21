import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/checkAdmin';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

export default async function PlatformAuditPage() {
  const { user } = await requireAdmin();
  const supabase = createClient();

  const { data: entries } = await supabase
    .from('platform_audit_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <BrandLogo layout="horizontal" variant="dark" />
            </Link>
            <div className="h-6 w-px bg-zinc-300 hidden sm:block" />
            <span className="hidden text-base font-bold text-black sm:block">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/metrics" className="text-sm text-zinc-500 hover:text-zinc-900">
              Metrics
            </Link>
            <Link href="/admin/audit" className="text-sm text-zinc-500 hover:text-zinc-900">
              Firm Audit
            </Link>
            <Link href="/admin/platform-audit" className="text-sm font-medium" style={{ color: ODPC_BLUE }}>
              Platform Audit
            </Link>
            <span className="hidden text-sm text-zinc-500 md:inline">
              {user.email}
            </span>
          </div>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8">
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: ODPC_BLUE }}
          >
            Platform
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Platform Audit Log
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Permanent record of admin actions across the entire platform. These logs survive even if a firm is deleted.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Date
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Admin
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Action
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Firm
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Details
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(entries ?? []).map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3 text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-900">
                      {e.admin_email || '—'}
                    </td>
                    <td className="px-6 py-3 text-sm capitalize text-zinc-700">
                      <span className="inline-block rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-semibold">
                        {String(e.action).replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-zinc-900">
                      {e.firm_name || '—'}
                    </td>
                    <td className="px-6 py-3 text-xs text-zinc-500 max-w-xs truncate">
                      {e.metadata ? JSON.stringify(e.metadata) : '—'}
                    </td>
                  </tr>
                ))}
                {(!entries || entries.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-sm text-zinc-400">
                      No platform actions recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}