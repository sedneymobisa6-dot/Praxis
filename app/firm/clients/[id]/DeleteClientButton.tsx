'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RED = '#DC2626';

export default function DeleteClientButton({
  clientId,
  clientName,
}: {
  clientId: string;
  clientName: string;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/firm/clients/${clientId}/delete`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not delete client.');
        setLoading(false);
        return;
      }

      router.push('/firm/dashboard');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong.');
      setLoading(false);
    }
  }

  if (!showConfirm) {
    return (
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        className="text-sm font-medium hover:underline"
        style={{ color: RED }}
      >
        Delete this client
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 mt-4">
      <h3 className="text-sm font-semibold text-red-800">
        Are you absolutely sure?
      </h3>
      <p className="mt-2 text-sm text-red-700">
        This will permanently delete <strong>{clientName}</strong> along with all
        their data subject requests, data breaches, certificates, and audit logs.
        This action cannot be undone.
      </p>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-white px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: RED }}
        >
          {loading ? 'Deleting...' : 'Yes, delete permanently'}
        </button>
        <button
          type="button"
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}