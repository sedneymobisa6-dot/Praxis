'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

const requestTypes = [
  { value: 'access', label: 'Right of Access', days: 7 },
  { value: 'rectification', label: 'Right to Rectification', days: 14 },
  { value: 'erasure', label: 'Right to Erasure', days: 14 },
  { value: 'portability', label: 'Right to Portability', days: 30 },
  { value: 'restriction', label: 'Right to Restriction', days: 14 },
  { value: 'objection', label: 'Right to Object', days: 14 },
];

const requesterTypes = [
  { value: 'student', label: 'Student' },
  { value: 'parent', label: 'Parent' },
  { value: 'guardian', label: 'Guardian' },
  { value: 'staff', label: 'Staff' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'other', label: 'Other' },
];

export default function NewRequestPage() {
  const router = useRouter();
  const supabase = createClient();

  const [requesterName, setRequesterName] = useState('');
  const [requesterType, setRequesterType] = useState('parent');
  const [requesterRelationship, setRequesterRelationship] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [requesterIdNumber, setRequesterIdNumber] = useState('');

  const [requestType, setRequestType] = useState('access');
  const [requestDescription, setRequestDescription] = useState('');
  const [dateReceived, setDateReceived] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedType = requestTypes.find((t) => t.value === requestType);
  const deadlineDate = (() => {
    const d = new Date(dateReceived);
    d.setDate(d.getDate() + (selectedType?.days ?? 14));
    return d.toISOString().split('T')[0];
  })();

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

    const { data: created, error: insertError } = await supabase
      .from('dsar_requests')
      .insert({
        tenant_id: profile.tenant_id,
        school_id: school.id,
        requester_name: requesterName,
        requester_type: requesterType,
        requester_relationship: requesterRelationship,
        requester_email: requesterEmail,
        requester_phone: requesterPhone,
        requester_id_number: requesterIdNumber,
        request_type: requestType,
        request_description: requestDescription,
        date_received: dateReceived,
        deadline_date: deadlineDate,
        status: 'open',
      })
      .select()
      .single();

    if (insertError || !created) {
      setError(insertError?.message ?? 'Failed to save request.');
      setLoading(false);
      return;
    }

    await supabase.from('audit_log').insert({
      tenant_id: profile.tenant_id,
      user_id: user.id,
      action: 'dsar_logged',
      entity_type: 'dsar_requests',
      entity_id: created.id,
      metadata: { request_type: requestType, requester_type: requesterType },
    });

    router.push('/dashboard/requests/' + created.id);
    router.refresh();
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
            href="/dashboard/requests"
            className="text-sm text-zinc-500 hover:text-zinc-900"
          >
            Cancel
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
            New Request
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Log a Data Subject Request
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Record the request and the system will track the legal deadline.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Requester Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Requester Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Jane Wanjiku"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Requester type
                </label>
                <select
                  value={requesterType}
                  onChange={(e) => setRequesterType(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                >
                  {requesterTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              {(requesterType === 'parent' || requesterType === 'guardian') && (
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Relationship to student
                  </label>
                  <input
                    type="text"
                    value={requesterRelationship}
                    onChange={(e) => setRequesterRelationship(e.target.value)}
                    placeholder="Mother, Father, Legal Guardian"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={requesterEmail}
                    onChange={(e) => setRequesterEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={requesterPhone}
                    onChange={(e) => setRequesterPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  ID number (optional)
                </label>
                <input
                  type="text"
                  value={requesterIdNumber}
                  onChange={(e) => setRequesterIdNumber(e.target.value)}
                  placeholder="National ID or birth certificate number"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Request Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Type of request
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                >
                  {requestTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label} ({t.days} days)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={requestDescription}
                  onChange={(e) => setRequestDescription(e.target.value)}
                  placeholder="What is the requester asking for?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Date received
                </label>
                <input
                  type="date"
                  required
                  value={dateReceived}
                  onChange={(e) => setDateReceived(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div
                className="rounded-lg border p-4"
                style={{ borderColor: ODPC_BLUE, backgroundColor: '#EBF2F9' }}
              >
                <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: ODPC_BLUE }}>
                  Legal Deadline
                </p>
                <p className="mt-1 text-sm text-zinc-700">
                  Based on your selection, the response is due by{' '}
                  <span className="font-semibold text-zinc-900">
                    {new Date(deadlineDate).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href="/dashboard/requests"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {loading ? 'Saving...' : 'Save request'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}