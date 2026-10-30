import Link from 'next/link';
import DeleteClientButton from './DeleteClientButton';

const ODPC_BLUE = '#0A3D62';

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

type Props = {
  clientId: string;
  clientName: string;
  dpiasCount: number;
  openBreaches: any[];
  openRequests: any[];
  recentActivity: any[];
  isLead: boolean;
  isFirm: boolean;
};

export default function DashboardLower({
  clientId,
  clientName,
  dpiasCount,
  openBreaches,
  openRequests,
  recentActivity,
  isLead,
  isFirm,
}: Props) {
  return (
    <>
      <div className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Data Protection Impact Assessments (DPIA)
            </h3>
            <p className="mt-1 text-sm text-zinc-500">
              Manage DPIAs for high risk projects (e.g. new EHR systems, CCTV, biometrics).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={'/firm/clients/' + clientId + '/dpia'}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              View all ({dpiasCount})
            </Link>
            <Link
              href={'/firm/clients/' + clientId + '/dpia/new'}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              + New DPIA
            </Link>
          </div>
        </div>
      </div>

      {openBreaches && openBreaches.length > 0 && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-red-700">
              Open Data Breaches
            </h3>
            <Link
              href={'/firm/clients/' + clientId + '/breach'}
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
                    href={'/firm/clients/' + clientId + '/breach/' + breach.id}
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
              href={'/firm/clients/' + clientId + '/requests'}
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
                    href={'/firm/clients/' + clientId + '/requests/' + req.id}
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
              href={'/firm/clients/' + clientId + '/requests/new'}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              <span>Log a data subject request</span>
              <span className="text-zinc-400">-&gt;</span>
            </Link>
            <Link
              href={'/firm/clients/' + clientId + '/breach/new'}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              <span>Report a data breach</span>
              <span className="text-zinc-400">-&gt;</span>
            </Link>
            <a
              href={'/api/firm/generate-privacy-notice/' + clientId + '?format=word'}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              <span>Download privacy notice (Word)</span>
              <span className="text-zinc-400">-&gt;</span>
            </a>
            <a
              href={'/api/firm/generate-audit-log/' + clientId}
              className="flex items-center justify-between rounded-lg border border-zinc-100 px-4 py-3 text-sm text-zinc-900 hover:bg-zinc-50"
            >
              <span>Download audit log (PDF)</span>
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

      {isLead && (
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Manage your team
          </h3>
          <p className="mt-2 text-sm text-zinc-500">
            Add managers and operators who will work with you on this firm. Only you can add or remove team members.
          </p>
          <Link
            href="/firm/team"
            className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Go to Team
          </Link>
        </div>
      )}

      {isLead && isFirm && (
        <div className="mt-12 border-t border-zinc-200 pt-8 pb-10">
          <h3 className="text-sm font-semibold text-zinc-900">Danger Zone</h3>
          <p className="mt-1 text-sm text-zinc-500">
            Once you delete a client, there is no going back. Please be certain.
          </p>
          <div className="mt-4">
            <DeleteClientButton clientId={clientId} clientName={clientName} />
          </div>
        </div>
      )}
    </>
  );
}