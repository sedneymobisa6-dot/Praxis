'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { sensitiveOptions, employeeOptions, turnoverOptions } from './options';

export default function IntakePage() {
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [schoolName, setSchoolName] = useState('');
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
    const tenantId = profile.tenant_id;
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .insert({
        tenant_id: tenantId,
        school_name: schoolName,
        postal_address: postalAddress,
        telephone,
        email,
        county,
        country: 'Kenya',
        sector: 'Education',
        legal_establishment: legalEstablishment,
        employee_count: employeeCount,
        turnover_range: turnover,
      })
      .select()
      .single();
    if (schoolError || !school) {
      setError(schoolError?.message ?? 'Failed to save school.');
      setLoading(false);
      return;
    }
    const activityRows = activities
      .filter((a) => a.data_subject_category && a.personal_data_description && a.purpose_of_processing)
      .map((a) => ({ tenant_id: tenantId, school_id: school.id, ...a }));
    if (activityRows.length > 0) {
      await supabase.from('processing_activities').insert(activityRows);
    }
    await supabase.from('sensitive_data').insert({
      tenant_id: tenantId,
      school_id: school.id,
      applicable: sensitiveApplicable,
      data_types: sensitiveTypes,
      purpose: sensitivePurpose,
    });
    const countriesArray = transferCountries.split(',').map((c) => c.trim()).filter(Boolean);
    await supabase.from('cross_border_transfers').insert({
      tenant_id: tenantId,
      school_id: school.id,
      applicable: transferApplicable,
      countries: countriesArray,
    });
    const measureRows = measures
      .filter((m) => m.risk_description && m.safeguard_description)
      .map((m, i) => ({
        tenant_id: tenantId,
        school_id: school.id,
        risk_description: m.risk_description,
        safeguard_description: m.safeguard_description,
        display_order: i + 1,
      }));
    if (measureRows.length > 0) {
      await supabase.from('security_measures').insert(measureRows);
    }
    await supabase.from('audit_log').insert({
      tenant_id: tenantId,
      user_id: user.id,
      action: 'intake_form_submitted',
      entity_type: 'schools',
      entity_id: school.id,
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
        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">ODPC Intake Form</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Section {step} of {totalSteps}
        </p>
        <div className="mt-4 h-1 w-full rounded-full bg-zinc-200">
          <div className="h-1 rounded-full bg-brand-600" style={{ width: `${progress}%` }} />
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Basic details</h2>
              <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School name" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <input type="text" value={postalAddress} onChange={(e) => setPostalAddress(e.target.value)} placeholder="Postal address" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <input type="text" value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Telephone" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <input type="text" value={county} onChange={(e) => setCounty(e.target.value)} placeholder="County" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              <input type="text" value={legalEstablishment} onChange={(e) => setLegalEstablishment(e.target.value)} placeholder="Legal establishment" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Personal data you process</h2>
              {activities.map((activity, index) => (
                <div key={index} className="rounded-md border border-zinc-200 p-4 space-y-3">
                  <input type="text" value={activity.data_subject_category} onChange={(e) => updateActivity(index, 'data_subject_category', e.target.value)} placeholder="Category (students, parents, staff)" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  <input type="text" value={activity.personal_data_description} onChange={(e) => updateActivity(index, 'personal_data_description', e.target.value)} placeholder="Data collected" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  <input type="text" value={activity.purpose_of_processing} onChange={(e) => updateActivity(index, 'purpose_of_processing', e.target.value)} placeholder="Purpose" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
              ))}
              <button onClick={() => setActivities([...activities, { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' }])} className="text-sm font-medium text-brand-600">+ Add another</button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Sensitive personal data</h2>
              <div className="flex gap-3">
                <button onClick={() => setSensitiveApplicable(true)} className={`rounded-md px-4 py-2 text-sm ${sensitiveApplicable ? 'bg-brand-600 text-white' : 'border border-zinc-300'}`}>Applicable</button>
                <button onClick={() => setSensitiveApplicable(false)} className={`rounded-md px-4 py-2 text-sm ${!sensitiveApplicable ? 'bg-brand-600 text-white' : 'border border-zinc-300'}`}>Not applicable</button>
              </div>
              {sensitiveApplicable && (
                <div className="space-y-2 pt-2">
                  {sensitiveOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 text-sm">
                      <input type="checkbox" checked={sensitiveTypes.includes(type)} onChange={() => toggleSensitiveType(type)} className="h-4 w-4" />
                      {type}
                    </label>
                  ))}
                  <input type="text" value={sensitivePurpose} onChange={(e) => setSensitivePurpose(e.target.value)} placeholder="Purpose" className="mt-2 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Transfers outside Kenya</h2>
              <div className="flex gap-3">
                <button onClick={() => setTransferApplicable(true)} className={`rounded-md px-4 py-2 text-sm ${transferApplicable ? 'bg-brand-600 text-white' : 'border border-zinc-300'}`}>Applicable</button>
                <button onClick={() => setTransferApplicable(false)} className={`rounded-md px-4 py-2 text-sm ${!transferApplicable ? 'bg-brand-600 text-white' : 'border border-zinc-300'}`}>Not applicable</button>
              </div>
              {transferApplicable && (
                <input type="text" value={transferCountries} onChange={(e) => setTransferCountries(e.target.value)} placeholder="Countries, comma separated" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Security measures</h2>
              {measures.map((measure, index) => (
                <div key={index} className="rounded-md border border-zinc-200 p-4 space-y-3">
                  <input type="text" value={measure.risk_description} onChange={(e) => updateMeasure(index, 'risk_description', e.target.value)} placeholder="Risk" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                  <input type="text" value={measure.safeguard_description} onChange={(e) => updateMeasure(index, 'safeguard_description', e.target.value)} placeholder="Safeguard" className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm" />
                </div>
              ))}
              <button onClick={() => setMeasures([...measures, { risk_description: '', safeguard_description: '' }])} className="text-sm font-medium text-brand-600">+ Add another</button>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Number of employees</h2>
              {employeeOptions.map((option) => (
                <label key={option} className="flex items-center gap-3 text-sm">
                  <input type="radio" name="employeeCount" checked={employeeCount === option} onChange={() => setEmployeeCount(option)} className="h-4 w-4" />
                  {option} employees
                </label>
              ))}
            </div>
          )}

          {step === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium">Previous year annual turnover</h2>
              {turnoverOptions.map((option) => (
                <label key={option.value} className="flex items-center gap-3 text-sm">
                  <input type="radio" name="turnover" checked={turnover === option.value} onChange={() => setTurnover(option.value)} className="h-4 w-4" />
                  {option.label}
                </label>
              ))}
            </div>
          )}

          {error && <div className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button onClick={() => setStep(step - 1)} className="text-sm text-zinc-600">Back</button>
            ) : <span />}
            {step < totalSteps ? (
              <button onClick={() => setStep(step + 1)} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white">Continue</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="rounded-md bg-brand-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                {loading ? 'Saving...' : 'Submit'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}