import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { requireAdmin } from '@/lib/admin/checkAdmin';

const ODPC_BLUE = '#0A3D62';

export default async function AdminAudit() {
  const { user } = await requireAdmin();
  const supabase = createClient();

  const { data: entries } = await supabase
    .from('audit_log')
    .select('id, action, entity_type, entity_id, created_at, firm_id, client_id')
    .order('created_at', { ascending: false })
    .limit(100);

  const firmIds = Array.from(new Set((entries ?? []).map((e) => e.firm_id).filter(Boolean)));
  const clientIds = Array.from(new Set((entries ?? []).map((e) => e.client_id).filter(Boolean)));

  const firmNames: Record<string, string> = {};
  const clientNames: Record<string, string> = {};

  if (firmIds.length > 0) {
    const { data: firms } = await supabase
      .from('firms')
      .select('id, name')
      .in('id', firmIds as string[]);
    (firms ?? []).forEach((f) => {
      firmNames[f.id] = f.name;
    });
  }

  if (clientIds.length > 0) {
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name')
      .in('id', clientIds as string[]);
    (clients ?? []).forEach((c) => {
      clientNames[c.id] = c.name;
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
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
          <div className="flex items-center gap-4">
            <Link href="/admin/metrics" className="text-sm text-zinc-500 hover:text-zinc-900">
              Metrics
            </Link>
            <Link href="/admin/audit" className="text-sm font-medium" style={{ color: ODPC_BLUE }}>
              Audit log
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
            Audit Log
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Last 100 actions across every firm.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 border-b border-zinc-200">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    When
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Firm
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Client
                  </th>
                  <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(entries ?? []).map((e) => (
                  <tr key={e.id} className="hover:bg-zinc-50">
                    <td className="px-6 py-3 text-xs text-zinc-500">
                      {new Date(e.created_at).toLocaleString('en-GB', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-900">
                      {e.firm_id && firmNames[e.firm_id] ? firmNames[e.firm_id] : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm text-zinc-900">
                      {e.client_id && clientNames[e.client_id] ? clientNames[e.client_id] : '-'}
                    </td>
                    <td className="px-6 py-3 text-sm capitalize text-zinc-700">
                      {String(e.action).replace(/_/g, ' ')}
                    </td>
                  </tr>
                ))}
                {(!entries || entries.length === 0) && (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-sm text-zinc-400">
                      No activity yet.
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