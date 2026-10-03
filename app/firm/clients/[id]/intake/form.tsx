'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { submitIntake } from './submit';
import Step1Basic from './steps/Step1Basic';
import Step2Activities from './steps/Step2Activities';
import Step3Sensitive from './steps/Step3Sensitive';
import Step4Transfers from './steps/Step4Transfers';
import Step5Measures from './steps/Step5Measures';
import Step6Employees from './steps/Step6Employees';
import Step7Turnover from './steps/Step7Turnover';

const ODPC_BLUE = '#0A3D62';

export type Activity = {
  data_subject_category: string;
  personal_data_description: string;
  purpose_of_processing: string;
};

export type Measure = {
  risk_description: string;
  safeguard_description: string;
};

export default function IntakeForm({ clientId }: { clientId: string }) {
  const router = useRouter();
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

  const [activities, setActivities] = useState<Activity[]>([
    { data_subject_category: '', personal_data_description: '', purpose_of_processing: '' },
  ]);

  const [sensitiveApplicable, setSensitiveApplicable] = useState(false);
  const [sensitiveTypes, setSensitiveTypes] = useState<string[]>([]);
  const [sensitivePurpose, setSensitivePurpose] = useState('');

  const [transferApplicable, setTransferApplicable] = useState(false);
  const [transferCountries, setTransferCountries] = useState('');

  const [measures, setMeasures] = useState<Measure[]>([
    { risk_description: '', safeguard_description: '' },
  ]);

  const [employeeCount, setEmployeeCount] = useState('');
  const [turnover, setTurnover] = useState('');

  const totalSteps = 7;
  const progress = (step / totalSteps) * 100;

  function handleSubmit() {
    setError('');
    setLoading(true);

    submitIntake({
      supabase,
      clientId,
      isEdit,
      postalAddress,
      telephone,
      email,
      county,
      legalEstablishment,
      activities,
      sensitiveApplicable,
      sensitiveTypes,
      sensitivePurpose,
      transferApplicable,
      transferCountries,
      measures,
      employeeCount,
      turnover,
    }).then((result) => {
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      router.push('/firm/clients/' + clientId);
      router.refresh();
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
            <Step1Basic
              postalAddress={postalAddress}
              setPostalAddress={setPostalAddress}
              telephone={telephone}
              setTelephone={setTelephone}
              email={email}
              setEmail={setEmail}
              county={county}
              setCounty={setCounty}
              legalEstablishment={legalEstablishment}
              setLegalEstablishment={setLegalEstablishment}
            />
          )}

          {step === 2 && (
            <Step2Activities
              activities={activities}
              setActivities={setActivities}
            />
          )}

          {step === 3 && (
            <Step3Sensitive
              sensitiveApplicable={sensitiveApplicable}
              setSensitiveApplicable={setSensitiveApplicable}
              sensitiveTypes={sensitiveTypes}
              setSensitiveTypes={setSensitiveTypes}
              sensitivePurpose={sensitivePurpose}
              setSensitivePurpose={setSensitivePurpose}
            />
          )}

          {step === 4 && (
            <Step4Transfers
              transferApplicable={transferApplicable}
              setTransferApplicable={setTransferApplicable}
              transferCountries={transferCountries}
              setTransferCountries={setTransferCountries}
            />
          )}

          {step === 5 && (
            <Step5Measures
              measures={measures}
              setMeasures={setMeasures}
            />
          )}

          {step === 6 && (
            <Step6Employees
              employeeCount={employeeCount}
              setEmployeeCount={setEmployeeCount}
            />
          )}

          {step === 7 && (
            <Step7Turnover
              turnover={turnover}
              setTurnover={setTurnover}
            />
          )}

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="text-sm text-zinc-600"
              >
                Back
              </button>
            ) : (
              <span />
            )}
            {step < totalSteps ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white"
                style={{ backgroundColor: ODPC_BLUE }}
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ backgroundColor: ODPC_BLUE }}
              >
                {loading ? 'Saving...' : isEdit ? 'Update details' : 'Submit intake form'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}