'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const supabase = createClient();
  const [certificateNumber, setCertificateNumber] = useState('');
  const [issuedAt, setIssuedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('tenant_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      setError('Could not find your profile.');
      setLoading(false);
      return;
    }

    const { data: school } = await supabase
      .from('schools')
      .select('id')
      .eq('tenant_id', profile.tenant_id)
      .maybeSingle();

    if (!school) {
      setError('Complete the intake form first.');
      setLoading(false);
      return;
    }

    const issuedDate = new Date(issuedAt);
    const expiryDate = new Date(issuedDate);
    expiryDate.setMonth(expiryDate.getMonth() + 24);

    const { error: updateError } = await supabase
      .from('schools')
      .update({
        certificate_number: certificateNumber,
        certificate_issued_at: issuedDate.toISOString(),
        certificate_expires_at: expiryDate.toISOString(),
      })
      .eq('id', school.id);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    await supabase.from('audit_log').insert({
      tenant_id: profile.tenant_id,
      user_id: user.id,
      action: 'certificate_registered',
      entity_type: 'schools',
      entity_id: school.id,
      metadata: { certificate_number: certificateNumber },
    });

    router.push('/dashboard');
    router.refresh();
  }

  return (
    <div className="container-narrow">
      <div className="mt-8">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
          Back to dashboard
        </Link>

        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">
          Mark as Registered
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Enter your ODPC certificate details. The system will track the 24-month renewal window.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Certificate Number
            </label>
            <input
              type="text"
              required
              value={certificateNumber}
              onChange={(e) => setCertificateNumber(e.target.value)}
              placeholder="ODPC/DC/2026/001234"
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700">
              Certificate Issue Date
            </label>
            <input
              type="date"
              required
              value={issuedAt}
              onChange={(e) => setIssuedAt(e.target.value)}
              className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
            <p className="mt-1 text-xs text-zinc-500">
              The certificate is valid for 24 months from this date.
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save certificate details'}
          </button>
        </form>
      </div>
    </div>
  );
}