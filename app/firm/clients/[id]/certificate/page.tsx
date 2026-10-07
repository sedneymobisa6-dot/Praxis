'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const RED = '#DC2626';

type Certificate = {
  id: string;
  client_id: string;
  certificate_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  certificate_type: string;
  form_filed: string;
  superseded_at: string | null;
  superseded_by: string | null;
};

function daysUntil(dateString: string | null) {
  if (!dateString) return null;
  const now = new Date();
  const target = new Date(dateString);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateString: string | null) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function CertificatePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Certificate | null>(null);
  const [history, setHistory] = useState<Certificate[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showRenewForm, setShowRenewForm] = useState(false);
  const [newCertificateNumber, setNewCertificateNumber] = useState('');
  const [newIssuedAt, setNewIssuedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );

  async function load() {
    setLoading(true);
    setError('');

    const { data: client } = await supabase
      .from('clients')
      .select('id, name')
      .eq('id', clientId)
      .maybeSingle();

    if (client) setClientName(client.name);

    const { data: certs, error: certErr } = await supabase
      .from('client_certificates')
      .select('*')
      .eq('client_id', clientId)
      .order('issued_at', { ascending: false });

    if (certErr) {
      setError(certErr.message);
      setLoading(false);
      return;
    }

    const all = (certs ?? []) as Certificate[];
    const current = all.find((c) => !c.superseded_at) ?? null;
    const past = all.filter((c) => c.superseded_at);

    setActive(current);
    setHistory(past);
    if (current?.certificate_number) {
      setNewCertificateNumber(current.certificate_number);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  async function handleRenew(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch(
        '/api/firm/certificate/' + active.id + '/mark-renewed',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            newCertificateNumber: newCertificateNumber.trim() || undefined,
            newIssuedAt: newIssuedAt
              ? new Date(newIssuedAt).toISOString()
              : undefined,
          }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not renew certificate.');
        setSaving(false);
        return;
      }

      setSuccess('Renewal filed. New certificate now active.');
      setShowRenewForm(false);
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

  const days = active?.expires_at ? daysUntil(active.expires_at) : null;

  let statusLabel = 'Not registered';
  let statusColor = 'text-zinc-600';
  let statusBg = 'bg-zinc-100';
  let ringColor = '#D4D4D8';

  if (days !== null) {
    if (days <= 0) {
      statusLabel = 'Expired';
      statusColor = 'text-red-700';
      statusBg = 'bg-red-50';
      ringColor = RED;
    } else if (days <= 30) {
      statusLabel = 'Expiring in ' + days + ' days';
      statusColor = 'text-red-700';
      statusBg = 'bg-red-50';
      ringColor = RED;
    } else if (days <= 60) {
      statusLabel = 'Renewal approaching';
      statusColor = 'text-amber-700';
      statusBg = 'bg-amber-50';
      ringColor = AMBER;
    } else {
      statusLabel = 'Active - ' + days + ' days left';
      statusColor = 'text-green-700';
      statusBg = 'bg-green-50';
      ringColor = GREEN;
    }
  }

  const needsRenewal = days !== null && days <= 60;

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link
            href={'/firm/clients/' + clientId}
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
            href={'/firm/clients/' + clientId}
            className="text-sm text-zinc-500"
          >
            Back to client
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
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Certificate of Registration
          </h1>
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

        {!active ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-10 text-center shadow-sm">
            <h2 className="text-lg font-semibold text-zinc-900">
              No certificate on file
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
              The client has not yet been registered with the ODPC, or the
              certificate details have not been recorded yet.
            </p>
            <Link
              href={'/firm/clients/' + clientId}
              className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-medium text-white"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              Return to client dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
              <div className="h-1 w-full" style={{ backgroundColor: ringColor }} />
              <div className="p-8">
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

                <h2 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
                  {active.certificate_type === 'renewal'
                    ? 'Renewal Certificate'
                    : 'Initial Registration'}
                </h2>

                <dl className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Certificate No.
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-zinc-900">
                      {active.certificate_number || '-'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Issued
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900">
                      {formatDate(active.issued_at)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                      Expires
                    </dt>
                    <dd className="mt-1 text-sm text-zinc-900">
                      {formatDate(active.expires_at)}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-wrap gap-3 border-t border-zinc-100 pt-6">
                  <a
                    href={'/api/firm/generate-dpr2/' + active.id}
                    className="rounded-lg border px-4 py-2 text-sm font-medium"
                    style={{ borderColor: ODPC_BLUE, color: ODPC_BLUE }}
                  >
                    Download Form DPR 2 (renewal)
                  </a>
                  {needsRenewal && (
                    <button
                      type="button"
                      onClick={() => setShowRenewForm((v) => !v)}
                      className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                      style={{ backgroundColor: ODPC_BLUE }}
                    >
                      {showRenewForm ? 'Cancel renewal' : 'Mark DPR 2 as filed'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {showRenewForm && (
              <form
                onSubmit={handleRenew}
                className="mt-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
              >
                <h3
                  className="text-sm font-semibold"
                  style={{ color: ODPC_BLUE }}
                >
                  File a renewal (Form DPR 2)
                </h3>
                <p className="mt-1 text-sm text-zinc-500">
                  The old certificate will be archived and a new certificate
                  will become active for 24 months.
                </p>

                <div className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700">
                      New certificate number
                    </label>
                    <input
                      type="text"
                      value={newCertificateNumber}
                      onChange={(e) =>
                        setNewCertificateNumber(e.target.value)
                      }
                      placeholder="Leave blank to reuse the previous number"
                      className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700">
                      Date of renewal
                    </label>
                    <input
                      type="date"
                      value={newIssuedAt}
                      onChange={(e) => setNewIssuedAt(e.target.value)}
                      className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRenewForm(false)}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ backgroundColor: ODPC_BLUE }}
                  >
                    {saving ? 'Filing...' : 'File renewal'}
                  </button>
                </div>
              </form>
            )}

            {history.length > 0 && (
              <div className="mt-8">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
                  Previous Certificates ({history.length})
                </h3>
                <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm">
                  {history.map((cert, i) => (
                    <div
                      key={cert.id}
                      className={
                        'px-6 py-4 ' +
                        (i > 0 ? 'border-t border-zinc-100' : '')
                      }
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-zinc-900">
                            {cert.certificate_type === 'renewal'
                              ? 'Renewal'
                              : 'Initial registration'}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-zinc-500">
                            {cert.certificate_number || '-'}
                          </p>
                        </div>
                        <div className="text-right text-xs text-zinc-500">
                          <p>Issued {formatDate(cert.issued_at)}</p>
                          <p>Superseded {formatDate(cert.superseded_at)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}