'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

const sectors = [
  { value: 'education', label: 'Education (school, college, university)' },
  { value: 'finance', label: 'Financial Services (bank, SACCO, lender, insurer)' },
  { value: 'health', label: 'Healthcare (hospital, clinic, lab, pharmacy)' },
  { value: 'transport', label: 'Transport (logistics, ride-hailing, fleet)' },
  { value: 'hospitality', label: 'Hospitality (hotel, restaurant, lounge)' },
  { value: 'other', label: 'Other ODPC-regulated sector' },
];

export default function NewClientPage() {
  const router = useRouter();
  const supabase = createClient();

  const [name, setName] = useState('');
  const [sector, setSector] = useState('education');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [postalAddress, setPostalAddress] = useState('');
  const [county, setCounty] = useState('');
  const [legalEstablishment, setLegalEstablishment] = useState('');
  const [employeeCount, setEmployeeCount] = useState('');
  const [turnoverRange, setTurnoverRange] = useState('');

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

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .insert({
        firm_id: firmUser.firm_id,
        name,
        sector,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        postal_address: postalAddress,
        county,
        legal_establishment: legalEstablishment,
        employee_count: employeeCount,
        turnover_range: turnoverRange,
      })
      .select()
      .single();

    if (clientError || !client) {
      setError(clientError?.message ?? 'Could not create client.');
      setLoading(false);
      return;
    }

    await supabase.from('audit_log').insert({
      firm_id: firmUser.firm_id,
      client_id: client.id,
      user_id: user.id,
      action: 'client_created',
      entity_type: 'clients',
      entity_id: client.id,
      metadata: { name, sector },
    });

    router.push('/firm/clients/' + client.id);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href="/firm/dashboard" className="flex items-center gap-3">
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
            href="/firm/dashboard"
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
            New Client
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900">
            Add a client
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            Enter the client&rsquo;s basic details. You will complete their full
            compliance intake from their dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Client Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Client name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Riverside Academy"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Sector *
                </label>
                <select
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                >
                  {sectors.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-zinc-500">
                  The sector determines which templates and legal bases are used
                  for this client.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Contact Details
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Contact person
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Jane Wanjiku"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Contact email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="admin@client.co.ke"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Contact phone
                  </label>
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+254 700 000 000"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Postal address
                </label>
                <input
                  type="text"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  placeholder="P.O. Box 4521-00100, Nairobi"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  County
                </label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  placeholder="Nairobi"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
              Registration Profile
            </h2>

            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Legal establishment
                </label>
                <input
                  type="text"
                  value={legalEstablishment}
                  onChange={(e) => setLegalEstablishment(e.target.value)}
                  placeholder="Certificate of Incorporation"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Number of employees
                  </label>
                  <select
                    value={employeeCount}
                    onChange={(e) => setEmployeeCount(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="1-9">1-9</option>
                    <option value="10-49">10-49</option>
                    <option value="50-99">50-99</option>
                    <option value="99+">More than 99</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700">
                    Annual turnover
                  </label>
                  <select
                    value={turnoverRange}
                    onChange={(e) => setTurnoverRange(e.target.value)}
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  >
                    <option value="">Select</option>
                    <option value="<2M">Less than KES 2M</option>
                    <option value="2M-5M">KES 2M - 5M</option>
                    <option value="5M-10M">KES 5M - 10M</option>
                    <option value="10M-50M">KES 10M - 50M</option>
                    <option value="50M+">More than KES 50M</option>
                  </select>
                </div>
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
              href="/firm/dashboard"
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
              {loading ? 'Creating...' : 'Create client'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}