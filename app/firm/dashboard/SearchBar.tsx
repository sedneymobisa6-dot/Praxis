'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ODPC_BLUE = '#0A3D62';

const SECTORS = [
  { value: '', label: 'All' },
  { value: 'education', label: 'Education' },
  { value: 'finance', label: 'Finance' },
  { value: 'health', label: 'Health' },
  { value: 'transport', label: 'Transport' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'other', label: 'Other' },
];

type Props = {
  initialQuery: string;
  initialSector: string;
};

export default function SearchBar(props: Props) {
  const router = useRouter();
  const [query, setQuery] = useState(props.initialQuery);
  const [sector, setSector] = useState(props.initialSector);

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (sector) params.set('sector', sector);
      const qs = params.toString();
      router.push('/firm/dashboard' + (qs ? '?' + qs : ''));
    }, 400);
    return () => clearTimeout(timer);
  }, [query, sector, router]);

  function pickSector(value: string) {
    setSector(value);
  }

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search clients by name..."
        className="block w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm shadow-sm"
      />
      <div className="flex flex-wrap gap-2">
        {SECTORS.map((s) => {
          const active = sector === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => pickSector(s.value)}
              className="rounded-full px-4 py-1.5 text-xs font-medium transition"
              style={
                active
                  ? { backgroundColor: ODPC_BLUE, color: 'white' }
                  : { backgroundColor: 'white', color: '#3f3f46', border: '1px solid #e4e4e7' }
              }
            >
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}