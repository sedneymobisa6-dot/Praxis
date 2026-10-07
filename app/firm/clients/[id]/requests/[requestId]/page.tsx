'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';
const RED = '#DC2626';

type DsarRequest = {
  id: string;
  client_id: string;
  requester_name: string;
  requester_type: string;
  requester_relationship: string | null;
  requester_email: string | null;
  requester_phone: string | null;
  requester_id_number: string | null;
  request_type: string;
  request_description: string;
  date_received: string;
  deadline_date: string;
  status: string;
  response_date: string | null;
  response_notes: string | null;
  decline_reason: string | null;
};

const typeLabels: Record<string, string> = {
  access: 'Right of Access',
  rectification: 'Right to Rectification',
  erasure: 'Right to Erasure',
  portability: 'Right to Portability',
  restriction: 'Right to Restriction',
  objection: 'Right to Object',
};

const legalBasis: Record<string, string> = {
  access:
    'Section 26(b) and Section 40(1)(a) of the Data Protection Act 2019; Regulation 9 of Legal Notice 263 of 2021',
  rectification:
    'Section 26(d) and Section 40(1)(a) of the Data Protection Act 2019; Regulation 10 of Legal Notice 263 of 2021',
  erasure:
    'Section 26(e) and Section 40(1)(b) of the Data Protection Act 2019; Regulation 12 of Legal Notice 263 of 2021',
  portability:
    'Section 38 of the Data Protection Act 2019; Regulation 11 of Legal Notice 263 of 2021',
  restriction:
    'Section 34 of the Data Protection Act 2019; Regulation 7 of Legal Notice 263 of 2021',
  objection:
    'Section 36 of the Data Protection Act 2019; Regulation 8 of Legal Notice 263 of 2021',
};

const typeDeadlineDays: Record<string, number> = {
  access: 7,
  rectification: 14,
  erasure: 14,
  portability: 30,
  restriction: 14,
  objection: 14,
};

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

function daysUntil(dateString: string) {
  const now = new Date();
  const target = new Date(dateString);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RequestDetailPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const requestId = params.requestId as string;
  const supabase = createClient();

  const [request, setRequest] = useState<DsarRequest | null>(null);
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');

  async function load() {
    setLoading(true);
    setError('');

    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .maybeSingle();

    if (client) setClientName(client.name);

    const { data, error: fetchErr } = await supabase
      .from('client_dsar_requests')
      .select('*')
      .eq('id', requestId)
      .eq('client_id', clientId)
      .maybeSingle();

    if (fetchErr) {
      setError(fetchErr.message);
      setLoading(false);
      return;
    }

    setRequest((data as DsarRequest) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId, clientId]);

  async function handleMarkResponded(e: React.FormEvent) {
    e.preventDefault();
    if (!request) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(
        '/api/firm/dsar/' + request.id + '/mark-responded',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes: responseNotes.trim() || undefined }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not mark as responded.');
        setSaving(false);
        return;
      }

      setSuccess('Marked as responded. The request is now closed.');
      setShowResponseForm(false);
      setResponseNotes('');
      await load();
      router.refresh();
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-zinc-500">Loading...</p>
        </main>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto max-w-3xl px-6 py-20 text-center">
          <p className="text-sm text-zinc-500">Request not found.</p>
          <Link
            href={'/firm/clients/' + clientId + '/requests'}
            className="mt-4 inline-block text-sm font-medium"
            style={{ color: ODPC_BLUE }}
          >
            Back to requests
          </Link>
        </main>
      </div>
    );
  }

  const days = daysUntil(request.deadline_date);
  const isClosed =
    request.status !== 'open' && request.status !== 'in_progress';
  const isOverdue = days < 0 && !isClosed;
  const isUrgent = days >= 0 && days <= 3 && !isClosed;
  const deadlineDays = typeDeadlineDays[request.request_type] ?? 14;

  let statusLabel = request.status.replace('_', ' ');
  let statusColor = 'text-zinc-600';
  let statusBg = 'bg-zinc-100';

  if (isOverdue) {
    statusLabel = 'Overdue';
    statusColor = 'text-red-700';
    statusBg = 'bg-red-50';
  } else if (isUrgent) {
    statusLabel = days + ' days left';
    statusColor = 'text-red-700';
    statusBg = 'bg-red-50';
  } else if (!isClosed) {
    statusLabel = days + ' days left';
    statusColor = 'text-green-700';
    statusBg = 'bg-green-50';
  } else if (request.status === 'responded') {
    statusLabel = 'Responded';
    statusColor = 'text-green-700';
    statusBg = 'bg-green-50';
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href={'/firm/clients/' + clientId + '/requests'}
            className="flex items-center gap-3"
          >
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
            href={'/firm/clients/' + clientId + '/requests'}
            className="text-sm text-zinc-500"
          >
            Back to requests
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
            {clientName}
          </p>
          <div className="mt-2 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
                {request.requester_name}
              </h1>
              <p className="mt-1 text-sm text-zinc-500">
                {typeLabels[request.request_type] ?? request.request_type}
              </p>
            </div>
            <span
              className={
                'inline-block rounded-full px-3 py-1 text-xs font-semibold ' +
                statusBg +
                ' ' +
                statusColor
              }
            >
              {statusLabel}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {success}
          </div>
        )}

        <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
          <div className="h-1 w-full" style={{ backgroundColor: ODPC_BLUE }} />
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Received
                </p>
                <p className="mt-1 text-sm text-zinc-900">
                  {formatDate(request.date_received)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Deadline
                </p>
                <p className="mt-1 text-sm text-zinc-900">
                  {formatDate(request.deadline_date)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Legal Window
                </p>
                <p className="mt-1 text-sm text-zinc-900">
                  {deadlineDays} days
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Requester
          </h2>
          <dl className="mt-5 space-y-3">
            <div className="flex justify-between border-b border-zinc-100 pb-3">
              <dt className="text-sm text-zinc-500">Type</dt>
              <dd className="text-sm font-medium capitalize text-zinc-900">
                {request.requester_type}
              </dd>
            </div>
            {request.requester_relationship && (
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Relationship</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {request.requester_relationship}
                </dd>
              </div>
            )}
            {request.requester_email && (
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Email</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {request.requester_email}
                </dd>
              </div>
            )}
            {request.requester_phone && (
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Phone</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {request.requester_phone}
                </dd>
              </div>
            )}
            {request.requester_id_number && (
              <div className="flex justify-between">
                <dt className="text-sm text-zinc-500">ID Number</dt>
                <dd className="text-sm font-medium text-zinc-900">
                  {request.requester_id_number}
                </dd>
              </div>
            )}
          </dl>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Request
          </h2>
          <p className="mt-4 text-sm text-zinc-700">
            {request.request_description}
          </p>
        </div>

        <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Legal Basis
          </h2>
          <p className="mt-4 text-sm text-zinc-700">
            {legalBasis[request.request_type]}
          </p>
        </div>

        {isClosed && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Response
            </h2>
            <dl className="mt-5 space-y-3">
              <div className="flex justify-between border-b border-zinc-100 pb-3">
                <dt className="text-sm text-zinc-500">Status</dt>
                <dd className="text-sm font-medium capitalize text-zinc-900">
                  {request.status.replace('_', ' ')}
                </dd>
              </div>
              {request.response_date && (
                <div className="flex justify-between border-b border-zinc-100 pb-3">
                  <dt className="text-sm text-zinc-500">Response Date</dt>
                  <dd className="text-sm font-medium text-zinc-900">
                    {formatDate(request.response_date)}
                  </dd>
                </div>
              )}
              {request.response_notes && (
                <div>
                  <dt className="text-sm text-zinc-500">Notes</dt>
                  <dd className="mt-2 text-sm text-zinc-700">
                    {request.response_notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        )}

        {!isClosed && (
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Close this request
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Once you have responded to the requester, mark this request as
              responded. It will be removed from the open queue and recorded
              in the audit log.
            </p>

            {!showResponseForm ? (
              <button
                type="button"
                onClick={() => setShowResponseForm(true)}
                className="mt-4 rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: GREEN }}
              >
                Mark as responded
              </button>
            ) : (
              <form onSubmit={handleMarkResponded} className="mt-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Response notes (optional)
                  </label>
                  <textarea
                    rows={4}
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="Describe how you responded to the request."
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowResponseForm(false);
                      setResponseNotes('');
                    }}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: GREEN }}
                  >
                    {saving ? 'Saving...' : 'Confirm response'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
            Generate Response Letter
          </h2>
          <p className="mt-2 text-sm text-zinc-500">
            Download a formal response letter for this request. It opens in
            Word, ready to review, edit, and sign.
          </p>
          <a
            href={
              '/api/firm/generate-dsar-response/' +
              request.id +
              '?format=word'
            }
            className="mt-4 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            Download response letter (Word)
          </a>
        </div>
      </main>
    </div>
  );
}