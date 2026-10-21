'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const RED = '#DC2626';

export default function DeleteFirmButton({
  firmId,
  firmName,
}: {
  firmId: string;
  firmName: string;
}) {
  const router = useRouter();
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isNameCorrect = confirmText === firmName;

  async function handleDelete() {
    if (!isNameCorrect) return;
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/firms/${firmId}/delete`, {
        method: 'DELETE',
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? 'Could not delete firm.');
        setLoading(false);
        return;
      }

      router.push('/admin');
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
        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
      >
        Delete this firm permanently
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-6 mt-4">
      <h3 className="text-sm font-semibold text-red-800">
        This action cannot be undone.
      </h3>
      <p className="mt-2 text-sm text-red-700">
        This will permanently delete <strong>{firmName}</strong>, all of its users, 
        all of its clients, and every single record (DSARs, breaches, certificates). 
        All data will be erased from the servers.
      </p>

      <div className="mt-5">
        <label className="block text-sm font-medium text-red-800">
          Please type <strong>{firmName}</strong> to confirm.
        </label>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={firmName}
          className="mt-2 block w-full max-w-md rounded-lg border border-red-300 bg-white px-3.5 py-2.5 text-sm text-zinc-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
        />
      </div>

      {error && (
        <div className="mt-4 rounded-lg border border-red-300 bg-white px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleDelete}
          disabled={!isNameCorrect || loading}
          className="rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          style={{ backgroundColor: RED }}
        >
          {loading ? 'Deleting...' : 'Permanently delete firm'}
        </button>
        <button
          type="button"
          onClick={() => {
            setShowConfirm(false);
            setConfirmText('');
          }}
          disabled={loading}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}