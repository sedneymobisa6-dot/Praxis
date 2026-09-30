'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type ProcessingActivity = {
  data_subject_category: string;
  personal_data_description: string;
  purpose_of_processing: string;
};

type SecurityMeasure = {
  risk_description: string;
  safeguard_description: string;
};

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

  const [activities, setActivities] = useState<ProcessingActivity[]>([
    { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' },
  ]);

  const [sensitiveApplicable, setSensitiveApplicable] = useState(false);
  const [sensitiveTypes, setSensitiveTypes] = useState<string[]>([]);
  const [sensitivePurpose, setSensitivePurpose] = useState('');

  const [transferApplicable, setTransferApplicable] = useState(false);
  const [transferCountries, setTransferCountries] = useState('');

  const [measures, setMeasures] = useState<SecurityMeasure[]>([
    { risk_description: '', safeguard_description: '' },
  ]);

  const [employeeCount, setEmployeeCount] = useState('');
  const [turnover, setTurnover] = useState('');

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  function addActivity() {
    setActivities([
      ...activities,
      { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' },
    ]);
  }

  function updateActivity(index: number, field: keyof ProcessingActivity, value: string) {
    const updated = [...activities];
    updated[index][field] = value;
    setActivities(updated);
  }

  function removeActivity(index: number) {
    if (activities.length === 1) return;
    setActivities(activities.filter((_, i) => i !== index));
  }

  function addMeasure() {
    setMeasures([...measures, { risk_description: '', safeguard_description: '' }]);
  }

  function updateMeasure(index: number, field: keyof SecurityMeasure, value: string) {
    const updated = [...measures];
    updated[index][field] = value;
    setMeasures(updated);
  }

  function removeMeasure(index: number) {
    if (measures.length === 1) return;
    setMeasures(measures.filter((_, i) => i !== index));
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
      .filter(
        (a) =>
          a.data_subject_category &&
          a.personal_data_description &&
          a.purpose_of_processing
      )
      .map((a) => ({
        tenant_id: tenantId,
        school_id: school.id,
        ...a,
      }));

    if (activityRows.length > 0) {
      const { error: actError } = await supabase
        .from('processing_activities')
        .insert(activityRows);
      if (actError) {
        setError(actError.message);
        setLoading(false);
        return;
      }
    }

    await supabase.from('sensitive_data').insert({
      tenant_id: tenantId,
      school_id: school.id,
      applicable: sensitiveApplicable,
      data_types: sensitiveTypes,
      purpose: sensitivePurpose,
    });

    const countriesArray = transferCountries
      .split(',')
      .map((c) => c.trim())
      .filter(Boolean);

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

  const sensitiveOptions = [
    'Racial or ethnic origin',
    'Political opinion or adherence',
    'Religious or philosophical beliefs',
    'Marital status and family details',
    'Physical or mental health or condition',
    'Sexual orientation, practices or preferences',
    'Biometric data',
  ];

  return (
    <div className="container-narrow">
      <div className="mt-8">
        <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-zinc-900">
          ← Back to dashboard
        </Link>

        <h1 className="mt-6 text-2xl font-semibold text-zinc-900">ODPC Intake Form</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Section {step} of {totalSteps}
        </p>

        <div className="mt-4 h-1 w-full rounded-full bg-zinc-200">
          <div
            className="h-1 rounded-full bg-brand-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-6">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Basic details</h2>

              <div>
                <label className="block text-sm font-medium text-zinc-700">School name *</label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Riverside Academy"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Postal address</label>
                <input
                  type="text"
                  value={postalAddress}
                  onChange={(e) => setPostalAddress(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="P.O. Box 1234"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Telephone</label>
                <input
                  type="text"
                  value={telephone}
                  onChange={(e) => setTelephone(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="+254 700 000 000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="admin@school.ac.ke"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">County</label>
                <input
                  type="text"
                  value={county}
                  onChange={(e) => setCounty(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Nairobi"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">Legal establishment</label>
                <input
                  type="text"
                  value={legalEstablishment}
                  onChange={(e) => setLegalEstablishment(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  placeholder="Certificate of Incorporation"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Personal data you process</h2>
              <p className="text-sm text-zinc-500">
                List each category of people whose data you handle, what data you collect, and why.
              </p>

              {activities.map((activity, index) => (
                <div key={index} className="rounded-md border border-zinc-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">Activity {index + 1}</span>
                    {activities.length > 1 && (
                      <button
                        onClick={() => removeActivity(index)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={activity.data_subject_category}
                    onChange={(e) => updateActivity(index, 'data_subject_category', e.target.value)}
                    placeholder="Category (e.g. students, parents, staff)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />

                  <input
                    type="text"
                    value={activity.personal_data_description}
                    onChange={(e) =>
                      updateActivity(index, 'personal_data_description', e.target.value)
                    }
                    placeholder="Data collected (e.g. name, ID, birth certificate, exam results)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />

                  <input
                    type="text"
                    value={activity.purpose_of_processing}
                    onChange={(e) =>
                      updateActivity(index, 'purpose_of_processing', e.target.value)
                    }
                    placeholder="Purpose (e.g. admissions, exams, payroll)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              ))}

              <button
                onClick={addActivity}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                + Add another activity
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Sensitive personal data</h2>
              <p className="text-sm text-zinc-500">
                Do you process any sensitive categories? For schools, children&rsquo;s data is always sensitive.
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSensitiveApplicable(true)}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    sensitiveApplicable
                      ? 'bg-brand-600 text-white'
                      : 'border border-zinc-300 text-zinc-700'
                  }`}
                >
                  Applicable
                </button>
                <button
                  onClick={() => setSensitiveApplicable(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    !sensitiveApplicable
                      ? 'bg-brand-600 text-white'
                      : 'border border-zinc-300 text-zinc-700'
                  }`}
                >
                  Not applicable
                </button>
              </div>

              {sensitiveApplicable && (
                <div className="space-y-3 pt-2">
                  {sensitiveOptions.map((type) => (
                    <label key={type} className="flex items-center gap-3 text-sm text-zinc-700">
                      <input
                        type="checkbox"
                        checked={sensitiveTypes.includes(type)}
                        onChange={() => toggleSensitiveType(type)}
                        className="h-4 w-4 rounded border-zinc-300 text-brand-600 focus:ring-brand-500"
                      />
                      {type}
                    </label>
                  ))}

                  <div className="pt-2">
                    <label className="block text-sm font-medium text-zinc-700">Purpose</label>
                    <input
                      type="text"
                      value={sensitivePurpose}
                      onChange={(e) => setSensitivePurpose(e.target.value)}
                      placeholder="e.g. student health records, pastoral care"
                      className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Transfers outside Kenya</h2>
              <p className="text-sm text-zinc-500">
                Do you use services that store data outside Kenya? (e.g. Google Classroom, Zoom, foreign cloud)
              </p>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTransferApplicable(true)}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    transferApplicable
                      ? 'bg-brand-600 text-white'
                      : 'border border-zinc-300 text-zinc-700'
                  }`}
                >
                  Applicable
                </button>
                <button
                  onClick={() => setTransferApplicable(false)}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    !transferApplicable
                      ? 'bg-brand-600 text-white'
                      : 'border border-zinc-300 text-zinc-700'
                  }`}
                >
                  Not applicable
                </button>
              </div>

              {transferApplicable && (
                <div className="pt-2">
                  <label className="block text-sm font-medium text-zinc-700">
                    List countries (separate with commas)
                  </label>
                  <input
                    type="text"
                    value={transferCountries}
                    onChange={(e) => setTransferCountries(e.target.value)}
                    placeholder="United States, Ireland, South Africa"
                    className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-zinc-900">Security measures</h2>
              <p className="text-sm text-zinc-500">
                Identify the risks to personal data and the safeguards you have in place.
              </p>

              {measures.map((measure, index) => (
                <div key={index} className="rounded-md border border-zinc-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">Measure {index + 1}</span>
                    {measures.length > 1 && (
                      <button
                        onClick={() => removeMeasure(index)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    type="text"
                    value={measure.risk_description}
                    onChange={(e) => updateMeasure(index, 'risk_description', e.target.value)}
                    placeholder="Risk (e.g. unauthorized access, theft)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />

                  <input
                    type="text"
                    value={measure.safeguard_description}
                    onChange={(e) =>
                      updateMeasure(index, 'safeguard_description', e.target.value)
                    }
                    placeholder="Safeguard (e.g. access control, CCTV, privacy policy)"
                    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              ))}

              <button
                onClick={addMeasure}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
 