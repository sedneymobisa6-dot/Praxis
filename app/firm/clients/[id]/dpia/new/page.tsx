'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import BrandLogo from '@/components/BrandLogo';

const ODPC_BLUE = '#0A3D62';

type RiskItem = {
  risk: string;
  impact: string;
  likelihood: string;
  actions: string;
};

export default function NewDpiaPage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  const [clientName, setClientName] = useState('');

  // Part 1: Description of Processing
  const [projectName, setProjectName] = useState('');
  const [assessmentNeed, setAssessmentNeed] = useState('');
  const [projectOutline, setProjectOutline] = useState('');
  const [personalDataTypes, setPersonalDataTypes] = useState('');
  const [informationFlow, setInformationFlow] = useState('');

  // Part 2: Necessity and Proportionality
  const [complianceMeasures, setComplianceMeasures] = useState('');

  // Part 3: Risk Assessment
  const [risks, setRisks] = useState<RiskItem[]>([
    { risk: '', impact: 'Low', likelihood: 'Low', actions: '' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadClient() {
      const { data } = await supabase
        .from('clients')
        .select('name')
        .eq('id', clientId)
        .maybeSingle();
      if (data) setClientName(data.name);
    }
    loadClient();
  }, [clientId, supabase]);

  function addRisk() {
    setRisks([...risks, { risk: '', impact: 'Low', likelihood: 'Low', actions: '' }]);
  }

  function removeRisk(index: number) {
    setRisks(risks.filter((_, i) => i !== index));
  }

  function updateRisk(index: number, field: keyof RiskItem, value: string) {
    const newRisks = [...risks];
    newRisks[index][field] = value;
    setRisks(newRisks);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/firm/dpia/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          projectName,
          assessmentNeed,
          projectOutline,
          personalDataTypes,
          informationFlow,
          complianceMeasures,
          risks,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not save the DPIA.');
        setLoading(false);
        return;
      }

      router.push('/firm/clients/' + clientId + '/dpia/' + json.dpiaId);
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <nav className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <Link href={'/firm/clients/' + clientId + '/dpia'} className="flex items-center gap-3">
            <BrandLogo layout="horizontal" variant="dark" />
          </Link>
          <Link
            href={'/firm/clients/' + clientId + '/dpia'}
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
          New Data Protection Impact Assessment
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Complete this assessment before deploying any high risk processing system.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-5" style={{ color: ODPC_BLUE }}>
              Part 1: Description of the Processing
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="E.g., Implementation of Electronic Health Records System"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Assess the need for DPIA *
                </label>
                <textarea
                  required
                  rows={2}
                  value={assessmentNeed}
                  onChange={(e) => setAssessmentNeed(e.target.value)}
                  placeholder="Explain why this project involves personal data likely to result in high risk."
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Project Outline *
                </label>
                <textarea
                  required
                  rows={3}
                  value={projectOutline}
                  onChange={(e) => setProjectOutline(e.target.value)}
                  placeholder="Explain broadly what the project aims to achieve and what type of processing it involves."
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Personal Data Involved *
                </label>
                <textarea
                  required
                  rows={2}
                  value={personalDataTypes}
                  onChange={(e) => setPersonalDataTypes(e.target.value)}
                  placeholder="E.g., Names, ID numbers, medical records, billing information."
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Describe the Information Flow *
                </label>
                <textarea
                  required
                  rows={4}
                  value={informationFlow}
                  onChange={(e) => setInformationFlow(e.target.value)}
                  placeholder="Describe the collection, use and deletion of personal data. Where are you getting the data from? How is it collected? Where will it be stored? Who will have access?"
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-5" style={{ color: ODPC_BLUE }}>
              Part 2: Necessity and Proportionality
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700">
                  Describe compliance and proportionality measures *
                </label>
                <textarea
                  required
                  rows={4}
                  value={complianceMeasures}
                  onChange={(e) => setComplianceMeasures(e.target.value)}
                  placeholder="Address the lawful basis for processing, methods of obtaining consent, data minimisation, how data subjects can exercise their rights, and safeguards in place."
                  className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold mb-2" style={{ color: ODPC_BLUE }}>
              Part 3: Risk Assessment
            </h2>
            <p className="text-xs text-zinc-500 mb-5">
              Identify privacy risks to data subjects and the measures you will take to mitigate them.
            </p>

            <div className="space-y-4">
              {risks.map((r, i) => (
                <div key={i} className="border border-zinc-200 rounded-lg p-4 bg-zinc-50 relative">
                  <button
                    type="button"
                    onClick={() => removeRisk(i)}
                    className="absolute top-3 right-3 text-xs text-red-600 font-medium"
                  >
                    Remove
                  </button>
                  
                  <div className="space-y-3 pr-16">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700">Risk Description</label>
                      <input
                        type="text"
                        required
                        value={r.risk}
                        onChange={(e) => updateRisk(i, 'risk', e.target.value)}
                        placeholder="E.g., Unauthorized access to patient records"
                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-700">Impact</label>
                        <select
                          value={r.impact}
                          onChange={(e) => updateRisk(i, 'impact', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm bg-white"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-700">Likelihood</label>
                        <select
                          value={r.likelihood}
                          onChange={(e) => updateRisk(i, 'likelihood', e.target.value)}
                          className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm bg-white"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-zinc-700">Mitigation Actions</label>
                      <input
                        type="text"
                        required
                        value={r.actions}
                        onChange={(e) => updateRisk(i, 'actions', e.target.value)}
                        placeholder="E.g., Implement Role Based Access Control and MFA"
                        className="mt-1 block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addRisk}
              className="mt-4 text-sm font-medium"
              style={{ color: ODPC_BLUE }}
            >
              + Add another risk
            </button>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3">
            <Link
              href={'/firm/clients/' + clientId + '/dpia'}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
              style={{ backgroundColor: ODPC_BLUE }}
            >
              {loading ? 'Saving...' : 'Save DPIA Draft'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}