'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

export default function BasicPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [postalAddress, setPostalAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [county, setCounty] = useState('');
  const [legalEstablishment, setLegalEstablishment] = useState('');
  const [publicBodyDepartment, setPublicBodyDepartment] = useState('');
  const [sector, setSector] = useState('');
  const [registrationRole, setRegistrationRole] = useState('controller');

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClient() {
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (data) {
        setPostalAddress(data.postal_address || '');
        setTelephone(data.contact_phone || '');
        setEmail(data.contact_email || '');
        setCounty(data.county || '');
        setLegalEstablishment(data.legal_establishment || '');
        setPublicBodyDepartment(data.public_body_department || '');
        setSector(data.sector || '');
        setRegistrationRole(data.registration_role || 'controller');
      }
      setFetching(false);
    }
    loadClient();
  }, [clientId, supabase]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    supabase
      .from('clients')
      .update({
        postal_address: postalAddress,
        contact_phone: telephone,
        contact_email: email,
        county: county,
        legal_establishment: legalEstablishment,
        public_body_department: publicBodyDepartment || null,
        registration_role: registrationRole,
      })
      .eq('id', clientId)
      .then((res) => {
        if (res.error) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
        router.push('/firm/clients/' + clientId + '/intake/activities');
      });
  }

  if (fetching) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <Link href={'/firm/clients/' + clientId} className="text-sm text-zinc-500">
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
          Section 1 of 6
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          Basic details
        </h1>

        <form
          onSubmit={handleSubmit}
          className="mt-8 space-y-4 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
        >
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-700 mb-3">
              ODPC Registration Role
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="regRole"
                  value="controller"
                  checked={registrationRole === 'controller'}
                  onChange={(e) => setRegistrationRole(e.target.value)}
                  className="h-4 w-4"
                />
                Data Controller (Determines the purpose and means of processing)
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="regRole"
                  value="processor"
                  checked={registrationRole === 'processor'}
                  onChange={(e) => setRegistrationRole(e.target.value)}
                  className="h-4 w-4"
                />
                Data Processor (Processes data on behalf of the controller)
              </label>
              <label className="flex items-center gap-3 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="regRole"
                  value="both"
                  checked={registrationRole === 'both'}
                  onChange={(e) => setRegistrationRole(e.target.value)}
                  className="h-4 w-4"
                />
                Both
              </label>
            </div>
          </div>

          <input
            type="text"
            value={postalAddress}
            onChange={(e) => setPostalAddress(e.target.value)}
            placeholder="Postal address"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
            placeholder="Telephone"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={county}
            onChange={(e) => setCounty(e.target.value)}
            placeholder="County"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
          <input
            type="text"
            value={legalEstablishment}
            onChange={(e) => setLegalEstablishment(e.target.value)}
            placeholder="Legal establishment"
            className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />

          {sector === 'public_bodies' && (
            <input
              type="text"
              value={publicBodyDepartment}
              onChange={(e) => setPublicBodyDepartment(e.target.value)}
              placeholder="State department or county department (For public bodies)"
              className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
            />
          )}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: ODPC_BLUE }}
          >
            {loading ? 'Saving...' : 'Continue'}
          </button>
        </form>
      </main>
    </div>
  );
}