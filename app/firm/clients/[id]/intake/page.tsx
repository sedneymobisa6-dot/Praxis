'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

const sensitiveOptions = [
  'Racial or ethnic origin',
  'Political opinion or adherence',
  'Religious or philosophical beliefs',
  'Marital status and family details',
  'Physical or mental health or condition',
  'Sexual orientation, practices or preferences',
  'Biometric data',
];

const employeeOptions = ['1-9', '10-49', '50-99', '99+'];

const turnoverOptions = [
  { value: '<2M', label: 'Less than KES 2,000,000' },
  { value: '2M-5M', label: 'KES 2,000,000 - 5,000,000' },
  { value: '5M-10M', label: 'KES 5,000,000 - 10,000,000' },
  { value: '10M-50M', label: 'KES 10,000,000 - 50,000,000' },
  { value: '50M+', label: 'More than KES 50,000,000' },
];

export default function FirmClientIntakePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');

  const [postalAddress, setPostalAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [county, setCounty] = useState('');
  const [legalEstablishment, setLegalEstablishment] = useState('');

  const [activities, setActivities] = useState([
    { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' },
  ]);

  const [sensitiveApplicable, setSensitiveApplicable] = useState(false);
  const [sensitiveTypes, setSensitiveTypes] = useState<string[]>([]);
  const [sensitivePurpose, setSensitivePurpose] = useState('');

  const [transferApplicable, setTransferApplicable] = useState(false);
  const [transferCountries, setTransferCountries] = useState('');

  const [measures, setMeasures] = useState([
    { risk_description: '', safeguard_description: '' },
  ]);

  const [employeeCount, setEmployeeCount] = useState('');
  const [turnover, setTurnover] = useState('');

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    async function load() {
      const { data: client } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (!client) {
        setInitializing(false);
        return;
      }

      setClientName(client.name || '');
      setPostalAddress(client.postal_address || '');
      setTelephone(client.contact_phone || '');
      setEmail(client.contact_email || '');
      setCounty(client.county || '');
      setLegalEstablishment(client.legal_establishment || '');
      setEmployeeCount(client.employee_count || '');
      setTurnover(client.turnover_range || '');

      const { data: acts } = await supabase
        .from('client_processing_activities')
        .select('*')
        .eq('client_id', clientId);

      if (acts && acts.length > 0) {
        setIsEdit(true);
        setActivities(
          acts.map((a: any) => ({
            data_subject_category: a.data_subject_category || '',
            personal_data_description: a.personal_data_description || '',
            purpose_of_processing: a.purpose_of_processing || '',
          }))
        );
      }

      const { data: sens } = await supabase
        .from('client_sensitive_data')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (sens) {
        setSensitiveApplicable(sens.applicable || false);
        setSensitiveTypes(sens.data_types || []);
        setSensitivePurpose(sens.purpose || '');
      }

      const { data: trans } = await supabase
        .from('client_cross_border_transfers')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (trans) {
        setTransferApplicable(trans.applicable || false);
        setTransferCountries((trans.countries || []).join(', '));
      }

      const { data: meas } = await supabase
        .from('client_security_measures')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order');

      if (meas && meas.length > 0) {
        setMeasures(
          meas.map((m: any) => ({
            risk_description: m.risk_description || '',
            safeguard_description: m.safeguard_description || '',
          }))
        );
      }

      setInitializing(false);
    }

    load();
  }, [clientId, supabase]);

  function updateActivity(index: number, field: string, value: string) {
    const updated = [...activities];
    (updated[index] as any)[field] = value;
    setActivities(updated);
  }

  function updateMeasure(index: number, field: string, value: string) {
    const updated = [...measures];
    (updated[index] as any)[field] = value;
    setMeasures(updated);
  }

  function toggleSensitiveType(type: string) {
    if (sensitiveTypes.includes(type)) {
      setSensitiveTypes(sensitiveTypes.filter((t) => t !== type));
    } else {
      setSensitiveTypes([...sensitiveTypes, type]);
    }
  }

  async function handleSubmit() {
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

    const firmId = firmUser.firm_id;

    await supabase
      .from('clients')
      .update({
        postal_address: postalAddress,
        contact_phone: telephone,
        contact_email: email,
        county,
        legal_establishment: legalEstablishment,
        employee_count: employeeCount,
        turnover_range: turnover,
      })
      .eq('id', clientId);

    await supabase.from('client_processing_activities').delete().eq('client_id', clientId);
    await supabase.from('client_sensitive_data').delete().eq('client_id', clientId);
    await supabase.from('client_cross_border_transfers').delete().eq('client_id', clientId);
    await supabase.from('client_security_measures').delete().eq('client_id', clientId);

    const activityRows = activities
      .filter(
        (a) =>
          a.data_subject_category &&
          a.personal_data_description &&
          a.purpose_of_processing
      )
      .map((a) => ({
        firm_id: firmId,
        client_id: clientId,
        ...a,
      }));

    if (activityRows.length > 0) {
      await supabase.from('client_processing_activities').insert(activityRows);
    }

    await supabase.from('client_sensitive_data').insert({
      firm_id: firmId,
      client_id: clientId,
      applicable: sensitiveApplicable,
      data_types: sensitiveTypes,
      purpose: sensitivePurpose,
    });

    const countriesArray = transferCountries
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

    await supabase.from('client_cross_border_transfers').insert({
      firm_id: firmId,
      client_id: clientId,
      applicable: transferApplicable,
      countries: countriesArray,
    });

    const measureRows = measures
      .filter((m) => m.risk_description && m.safeguard_description)
      .map((m, i) => ({
        firm_id: firmId,
        client_id: clientId,
        risk_description: m.risk_description,
        safeguard_description: m.safeguard_description,
        display_order: i + 1,
      }));

    if (measureRows.length > 0) {
      await supabase.from('client_security_measures').insert(measureRows);
    }

    await supabase.from('audit_log').insert({
      firm_id: firmId,
      client_id: clientId,
      user_id: user.id,
      action: isEdit ? 'intake_updated' : 'intake_submitted',
      entity_type: 'clients',
      entity_id: clientId,
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
          {isEdit ? 'Edit Intake Form' : 'Client Intake Form'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Section {step} of {totalSteps}
        </p>

        <div className="mt-4 h-1 w-full rounded-full bg-zinc-200">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: progress + '%', backgroundColor: ODPC_BLUE }}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Basic details</h2>
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
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">
                Personal data processed
              </h2>
              {activities.map((activity, index) => (
                <div key={index} className="rounded-lg border border-zinc-200 p-4 space-y-3">
                  <input
                    type="text"
                    value={activity.data_subject_category}
                    onChange={(e) => updateActivity(index, 'data_subject_category', e.target.value)}
                    placeholder="Category (students, customers, patients, staff)"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={activity.personal_data_description}
                    onChange={(e) => updateActivity(index, 'personal_data_description', e.target.value)}
                    placeholder="Data collected"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={activity.purpose_of_processing}
                    onChange={(e) => updateActivity(index, 'purpose_of_processing', e.target.value)}
                    placeholder="Purpose"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setActivities([
                    ...activities,
                    { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' },
                  ])
                }
                className="text-sm font-medium"
                style={{ color: ODPC_BLUE }}
              >
                + Add another
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">
                Sensitive personal data
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSensitiveApplicable(true)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    sensitiveApplicable
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Applicable
                </button>
                <button
                  type="button"
                  onClick={() => setSensitiveApplicable(false)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    !sensitiveApplicable
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Not applicable
                </button>
              </div>
              {sensitiveApplicable && (
                <div className="space-y-2 pt-2">
                  {sensitiveOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={sensitiveTypes.includes(type)}
                        onChange={() => toggleSensitiveType(type)}
                        className="h-4 w-4"
                      />
                      {type}
                    </label>
                  ))}
                  <input
                    type="text"
                    value={sensitivePurpose}
                    onChange={(e) => setSensitivePurpose(e.target.value)}
                    placeholder="Purpose"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">
                Transfers outside Kenya
              </h2>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferApplicable(true)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    transferApplicable
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Applicable
                </button>
                <button
                  type="button"
                  onClick={() => setTransferApplicable(false)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    !transferApplicable
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Not applicable
                </button>
              </div>
              {transferApplicable && (
                <input
                  type="text"
                  value={transferCountries}
                  onChange={(e) => setTransferCountries(e.target.value)}
                  placeholder="Countries, comma separated"
                  className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Security measures</h2>
              {measures.map((measure, index) => (
                <div key={index} className="rounded-lg border border-zinc-200 p-4 space-y-3">
                  <input
                    type="text"
                    value={measure.risk_description}
                    onChange={(e) => updateMeasure(index, 'risk_description', e.target.value)}
                    placeholder="Risk"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={measure.safeguard_description}
                    onChange={(e) => updateMeasure(index, 'safeguard_description', e.target.value)}
                    placeholder="Safeguard"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  setMeasures([...measures, { risk_description: '', safeguard_description: '' }])
                }
                className="text-sm font-medium"
                style={{ color: ODPC_BLUE }}
              >
                + Add another
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Number of employees</h2>
              {employeeOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 text-sm">
                  <input
                    type="radio"
                    name="employeeCount"
                    che