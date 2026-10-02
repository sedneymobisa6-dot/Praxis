'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function CertificatePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [initializing, setInitializing] = useState(true);
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [clientName, setClientName] = useState('');
  const [existingId, setExistingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: client } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle();

      if (client) setClientName(client.name);

      const { data: cert } = await supabase
        .from('client_certificates')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (cert) {
        setExistingId(cert.id);
        setCertificateNumber(cert.certificate_number || '');
        if (cert.issued_at) {
          const d = new Date(cert.issued_at);
          const iso = d.toISOString().split('T')[0];
          setIssuedAt(iso);
        }
      }

      setInitializing(false);
    }

    load();
  }, [clientId, supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError('Not signed in.');
      setLoading(false);
      return;
    }

    const { data: firmUser } = await supabase
      .from('firm_users')
      .select('firm_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!firmUser) {
      setError('Could not find your firm.');
      setLoading(false);
      return;
    }

    const issuedDate = new Date(issuedAt);
    const expiryDate = new Date(issuedDate);
    expiryDate.setMonth(expiryDate.getMonth() + 24);

    const payload = {
      firm_id: firmUser.firm_id,
      client_id: clientId,
      certificate_number: certificateNumber,
      issued_at: issuedDate.toISOString(),
      expires_at: expiryDate.toISOString(),
    };

    if (existingId) {
      const { error: updateError } = await supabase
        .from('client_certificates')
        .update(payload)
        .eq('id', existingId);

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('client_certificates')
        .insert(payload);

      if (insertError) {
        setError(insertError.message);
        setLoading(false);
        return;
      }
    }

    await supabase.from('audit_log').insert({
      firm_id: firmUser.firm_id,
      client_id: clientId,
      user_id: user.id,
      action: 'certificate_recorded',
      entity_type: 'client_certificates',
      entity_id: clientId,
      metadata: { certificate_number: certificateNumber },
    });

    router.push('/firm/clients/' + clientId);
    router.refresh();
  }

  if (initializing) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-zinc-500">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId} className="flex items-center gap-3">
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
            Cancel
          </Link>
        </div>
        <div className="h-[3px] w-full" style={{ backgroundColor: ODPC_BLUE }} />
      </nav>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: ODPC_BLUE }}
        >
          {clientName}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {existingId ? 'Update Certificate' : 'Record Certificate'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter the ODPC certificate details. The system will track the
          24-month renewal window.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-5 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Certificate number
            </label>
            <input
              type="text"
              required
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="ODPC/DC/2026/001234"
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Certificate issue date
            </label>
            <input
              type="date"
              required
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">
              The certificate is valid for 24 months from this date.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            {loading ? 'Saving...' : existingId ? 'Update certificate' : 'Save certificate'}
          </button>
        </form>
      </main>
    </div>
  );
}