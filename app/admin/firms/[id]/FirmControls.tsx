'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';
const RED = '#DC2626';
const GREEN = '#16A34A';

const TIERS = [
  { value: 'starter', label: 'Starter (1-5)', limit: 5, fee: 10000 },
  { value: 'small', label: 'Small (6-10)', limit: 10, fee: 20000 },
  { value: 'growth', label: 'Growth (11-20)', limit: 20, fee: 35000 },
  { value: 'professional', label: 'Professional (21-50)', limit: 50, fee: 60000 },
  { value: 'business', label: 'Business (51-100)', limit: 100, fee: 100000 },
  { value: 'enterprise', label: 'Enterprise (101-200)', limit: 200, fee: 150000 },
  { value: 'custom', label: 'Custom (200+)', limit: 9999, fee: 200000 },
];

type Props = {
  firmId: string;
  currentTier: string;
  currentLimit: number;
  currentFee: number;
  currentStatus: string;
};

export default function FirmControls(props: Props) {
  const router = useRouter();
  const supabase = createClient();

  const [tier, setTier] = useState(props.currentTier);
  const [limit, setLimit] = useState(String(props.currentLimit));
  const [fee, setFee] = useState(String(props.currentFee));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function onTierChange(value: string) {
    setTier(value);
    const found = TIERS.find((t) => t.value === value);
    if (found) {
      setLimit(String(found.limit));
      setFee(String(found.fee));
    }
  }

  function save() {
    setError('');
    setSuccess('');
    setLoading(true);

    const limitNum = parseInt(limit, 10);
    const feeNum = parseInt(fee, 10);

    if (isNaN(limitNum) || isNaN(feeNum)) {
      setError('Limit and fee must be numbers.');
      setLoading(false);
      return;
    }

    supabase
      .from('firms')
      .update({
        tier: tier,
        client_limit: limitNum,
        monthly_fee_kes: feeNum,
      })
      .eq('id', props.firmId)
      .then((res) => {
        if (res.error) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
        setSuccess('Saved.');
        setLoading(false);
        router.refresh();
      });
  }

  function setStatus(newStatus: string) {
    setError('');
    setSuccess('');
    setLoading(true);

    supabase
      .from('firms')
      .update({ subscription_status: newStatus })
      .eq('id', props.firmId)
      .then((res) => {
        if (res.error) {
          setError(res.error.message);
          setLoading(false);
          return;
        }
        setSuccess('Status updated to ' + newStatus + '.');
        setLoading(false);
        router.refresh();
      });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h2 className="text-sm font-semibold" style={{ color: ODPC_BLUE }}>
        Controls
      </h2>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Tier
          </label>
          <select
            value={tier}
            onChange={(e) => onTierChange(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          >
            {TIERS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Client limit
          </label>
          <input
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Monthly fee (KES)
          </label>
          <input
            type="number"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            className="mt-2 block w-full rounded-lg border border-zinc-300 px-3.5 py-2.5 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Current status
          </label>
          <p className="mt-2 text-sm capitalize text-zinc-900">
            {props.currentStatus}
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-3.5 py-2.5 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={save}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: ODPC_BLUE }}
        >
          {loading ? 'Saving...' : 'Save changes'}
        </button>

        {props.currentStatus !== 'active' && (
          <button
            type="button"
            onClick={() => setStatus('active')}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: GREEN }}
          >
            Activate
          </button>
        )}

        {props.currentStatus !== 'suspended' && (
          <button
            type="button"
            onClick={() => setStatus('suspended')}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            style={{ backgroundColor: RED }}
          >
            Suspend
          </button>
        )}
      </div>
    </div>
  );
}