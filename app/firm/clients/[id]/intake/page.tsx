'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

const SENSITIVE = [
  'Racial or ethnic origin',
  'Political opinion or adherence',
  'Religious or philosophical beliefs',
  'Marital status and family details',
  'Physical or mental health or condition',
  'Sexual orientation, practices or preferences',
  'Biometric data',
];

const EMPLOYEES = ['1-9', '10-49', '50-99', '99+'];

const TURNOVER = [
  { v: '<2M', l: 'Less than KES 2,000,000' },
  { v: '2M-5M', l: 'KES 2,000,000 - 5,000,000' },
  { v: '5M-10M', l: 'KES 5,000,000 - 10,000,000' },
  { v: '10M-50M', l: 'KES 10,000,000 - 50,000,000' },
  { v: '50M+', l: 'More than KES 50,000,000' },
];

export default function IntakePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');

  const [postalAddress, setPostalAddress] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [county, setCounty] = useState('');
  const [legalEstablishment, setLegalEstablishment] = useState('');

  const [aCat, setACat] = useState(['']);
  const [aData, setAData] = useState(['']);
  const [aPurp, setAPurp] = useState(['']);

  const [sensApp, setSensApp] = useState(false);
  const [sensTypes, setSensTypes] = useState<string[]>([]);
  const [sensPurp, setSensPurp] = useState('');

  const [trApp, setTrApp] = useState(false);
  const [trCountries, setTrCountries] = useState('');

  const [mRisk, setMRisk] = useState(['']);
  const [mSafe, setMSafe] = useState(['']);

  const [emp, setEmp] = useState('');
  const [turn, setTurn] = useState('');

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: c } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .maybeSingle();

      if (cancelled || !c) return;

      setClientName(c.name || '');
      setPostalAddress(c.postal_address || '');
      setTelephone(c.contact_phone || '');
      setEmail(c.contact_email || '');
      setCounty(c.county || '');
      setLegalEstablishment(c.legal_establishment || '');
      setEmp(c.employee_count || '');
      setTurn(c.turnover_range || '');

      const { data: acts } = await supabase
        .from('client_processing_activities')
        .select('*')
        .eq('client_id', clientId);

      if (!cancelled && acts && acts.length > 0) {
        setIsEdit(true);
        const cats: string[] = [];
        const datas: string[] = [];
        const purps: string[] = [];
        acts.forEach((a: any) => {
          cats.push(a.data_subject_category || '');
          datas.push(a.personal_data_description || '');
          purps.push(a.purpose_of_processing || '');
        });
        setACat(cats);
        setAData(datas);
        setAPurp(purps);
      }

      const { data: sens } = await supabase
        .from('client_sensitive_data')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (!cancelled && sens) {
        setSensApp(sens.applicable || false);
        setSensTypes(sens.data_types || []);
        setSensPurp(sens.purpose || '');
      }

      const { data: tr } = await supabase
        .from('client_cross_border_transfers')
        .select('*')
        .eq('client_id', clientId)
        .maybeSingle();

      if (!cancelled && tr) {
        setTrApp(tr.applicable || false);
        setTrCountries((tr.countries || []).join(', '));
      }

      const { data: meas } = await supabase
        .from('client_security_measures')
        .select('*')
        .eq('client_id', clientId)
        .order('display_order');

      if (!cancelled && meas && meas.length > 0) {
        const risks: string[] = [];
        const safes: string[] = [];
        meas.forEach((m: any) => {
          risks.push(m.risk_description || '');
          safes.push(m.safeguard_description || '');
        });
        setMRisk(risks);
        setMSafe(safes);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [clientId, supabase]);

  function addActivity() {
    const nc = [...aCat];
    const nd = [...aData];
    const np = [...aPurp];
    nc.push('');
    nd.push('');
    np.push('');
    setACat(nc);
    setAData(nd);
    setAPurp(np);
  }

  function setActivity(i: number, field: string, value: string) {
    if (field === 'cat') {
      const arr = [...aCat];
      arr[i] = value;
      setACat(arr);
    } else if (field === 'data') {
      const arr = [...aData];
      arr[i] = value;
      setAData(arr);
    } else {
      const arr = [...aPurp];
      arr[i] = value;
      setAPurp(arr);
    }
  }

  function addMeasure() {
    const nr = [...mRisk];
    const ns = [...mSafe];
    nr.push('');
    ns.push('');
    setMRisk(nr);
    setMSafe(ns);
  }

  function setMeasure(i: number, field: string, value: string) {
    if (field === 'risk') {
      const arr = [...mRisk];
      arr[i] = value;
      setMRisk(arr);
    } else {
      const arr = [...mSafe];
      arr[i] = value;
      setMSafe(arr);
    }
  }

  function toggleSensType(t: string) {
    if (sensTypes.includes(t)) {
      setSensTypes(sensTypes.filter((x) => x !== t));
    } else {
      const arr = [...sensTypes];
      arr.push(t);
      setSensTypes(arr);
    }
  }

  function handleSubmit() {
    setError('');
    setLoading(true);

    supabase.auth.getUser().then((r1) => {
      const user = r1.data.user;
      if (!user) {
        setError('Not signed in.');
        setLoading(false);
        return;
      }

      supabase
        .from('firm_users')
        .select('firm_id')
        .eq('user_id', user.id)
        .maybeSingle()
        .then((r2) => {
          if (!r2.data) {
            setError('Firm not found.');
            setLoading(false);
            return;
          }

          const firmId = r2.data.firm_id;
          const userId = user.id;

          supabase
            .from('clients')
            .update({
              postal_address: postalAddress,
              contact_phone: telephone,
              contact_email: email,
              county: county,
              legal_establishment: legalEstablishment,
              employee_count: emp,
              turnover_range: turn,
            })
            .eq('id', clientId)
            .then(() => {
              supabase
                .from('client_processing_activities')
                .delete()
                .eq('client_id', clientId)
                .then(() => {
                  supabase
                    .from('client_sensitive_data')
                    .delete()
                    .eq('client_id', clientId)
                    .then(() => {
                      supabase
                        .from('client_cross_border_transfers')
                        .delete()
                        .eq('client_id', clientId)
                        .then(() => {
                          supabase
                            .from('client_security_measures')
                            .delete()
                            .eq('client_id', clientId)
                            .then(() => {
                              const actRows: any[] = [];
                              for (let i = 0; i < aCat.length; i++) {
                                if (aCat[i] && aData[i] && aPurp[i]) {
                                  actRows.push({
                                    firm_id: firmId,
                                    client_id: clientId,
                                    data_subject_category: aCat[i],
                                    personal_data_description: aData[i],
                                    purpose_of_processing: aPurp[i],
                                  });
                                }
                              }

                              const finish = () => {
                                const countries = trCountries
                                  .split(',')
                                  .map((c) => c.trim())
                                  .filter(Boolean);

                                supabase
                                  .from('client_cross_border_transfers')
                                  .insert({
                                    firm_id: firmId,
                                    client_id: clientId,
                                    applicable: trApp,
                                    countries: countries,
                                  })
                                  .then(() => {
                                    const measRows: any[] = [];
                                    for (let i = 0; i < mRisk.length; i++) {
                                      if (mRisk[i] && mSafe[i]) {
                                        measRows.push({
                                          firm_id: firmId,
                                          client_id: clientId,
                                          risk_description: mRisk[i],
                                          safeguard_description: mSafe[i],
                                          display_order: i + 1,
                                        });
                                      }
                                    }

                                    const finish2 = () => {
                                      supabase
                                        .from('audit_log')
                                        .insert({
                                          firm_id: firmId,
                                          client_id: clientId,
                                          user_id: userId,
                                          action: isEdit
                                            ? 'intake_updated'
                                            : 'intake_submitted',
                                          entity_type: 'clients',
                                          entity_id: clientId,
                                        })
                                        .then(() => {
                                          router.push(
                                            '/firm/clients/' + clientId
                                          );
                                          router.refresh();
                                        });
                                    };

                                    if (measRows.length > 0) {
                                      supabase
                                        .from('client_security_measures')
                                        .insert(measRows)
                                        .then(finish2);
                                    } else {
                                      finish2();
                                    }
                                  });
                              };

                              supabase
                                .from('client_sensitive_data')
                                .insert({
                                  firm_id: firmId,
                                  client_id: clientId,
                                  applicable: sensApp,
                                  data_types: sensTypes,
                                  purpose: sensPurp,
                                })
                                .then(() => {
                                  if (actRows.length > 0) {
                                    supabase
                                      .from('client_processing_activities')
                                      .insert(actRows)
                                      .then(finish);
                                  } else {
                                    finish();
                                  }
                                });
                            });
                        });
                    });
                });
            });
        });
    });
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
          {clientName || 'Client'}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900">
          {isEdit ? 'Edit Intake Form' : 'Client Intake Form'}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Section {step} of {totalSteps}
        </p>

        <div className="mt-4 h-1 w-full rounded-full bg-zinc-200">
          <div
            className="h-1 rounded-full"
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
              {aCat.map((_, i) => (
                <div key={i} className="rounded-lg border border-zinc-200 p-4 space-y-3">
                  <input
                    type="text"
                    value={aCat[i]}
                    onChange={(e) => setActivity(i, 'cat', e.target.value)}
                    placeholder="Category"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={aData[i]}
                    onChange={(e) => setActivity(i, 'data', e.target.value)}
                    placeholder="Data collected"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                  <input
                    type="text"
                    value={aPurp[i]}
                    onChange={(e) => setActivity(i, 'purp', e.target.value)}
                    placeholder="Purpose"
                    className="block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addActivity}
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
                  onClick={() => setSensApp(true)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    sensApp
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Applicable
                </button>
                <button
                  type="button"
                  onClick={() => setSensApp(false)}
                  className="rounded-lg px-4 py-2 text-sm"
                  style={
                    !sensApp
                      ? { backgroundColor: ODPC_BLUE, color: 'white' }
                      : { border: '1px solid #d4d4d8' }
                  }
                >
                  Not applicable
                </button>
              </div>
              {sensApp && (
                <div className="space-y-2 pt-2">
                  {SENSITIVE.map((t) => (
                    <label key={t} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        checked={sensTypes.includes(t)}
                        onChange={() => toggleSensType(t)}
                        className="h-4 w-4"
                      />
                      {t}
                    </label>
                  ))}
                  <input
                    type="text"
                    value={sensPurp}
                    onChange={(e) => setSensPurp(e.target.value)}
                    placeholder="Purpose"
                    className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                  />
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 class