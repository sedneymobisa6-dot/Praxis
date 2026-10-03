'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

const ODPC_BLUE = '#0A3D62';

export default function CompletePage() {
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const supabase = createClient();

  useEffect(() => {
    router.push('/firm/clients/' + clientId);
  }, [clientId, router]);

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto max-w-3xl px-6 py-20 text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: '#EBF2F9' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke={ODPC_BLUE}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-900">
          Intake complete
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          Returning to the client dashboard...
        </p>
      </main>
    </div>
  );
}