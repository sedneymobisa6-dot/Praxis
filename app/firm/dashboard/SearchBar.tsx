'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SECTOR_LIST } from '@/lib/sectors';

const ODPC_BLUE = '#0A3D62';

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

      <div className="-mx-6 overflow-x-auto px-6">
        <div className="flex gap-2 pb-1" style={{ minWidth: 'max-content' }}>
          <button
            type="button"
            onClick={() => pickSector('')}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium"
            style={
              sector === ''
                ? { backgroundColor: ODPC_BLUE, color: 'white' }
                : { backgroundColor: 'white', color: '#3f3f46', border: '1px solid #e4e4e7' }
            }
          >
            All
          </button>

          {SECTOR_LIST.map((s) => {
            const active = sector === s.code;
            const short = s.label.split('(')[0].trim();
            return (
              <button
                key={s.code}
                type="button"
                onClick={() => pickSector(s.code)}
                className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium"
                style={
                  active
                    ? { backgroundColor: ODPC_BLUE, color: 'white' }
                    : { backgroundColor: 'white', color: '#3f3f46', border: '1px solid #e4e4e7' }
                }
              >
                {short}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}