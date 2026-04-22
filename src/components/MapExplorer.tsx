import { useEffect, useState } from 'react';

import type { Facility, ITL1 } from '../data/schema';
import { applyFilters, type FilterState } from '../lib/filters';
import { DetailPanel } from './DetailPanel';
import { FilterBar } from './FilterBar';
import { ListView } from './ListView';
import { MapView } from './MapView';

export function MapExplorer({ facilities }: { facilities: Facility[] }) {
  const [filters, setFilters] = useState<FilterState>({});
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [view, setView] = useState<'map' | 'list'>('map');

  const filteredFacilities = applyFilters(facilities, filters);
  const selectedFacility =
    filteredFacilities.find((facility) => facility.slug === selectedSlug) ?? null;
  const funders = [...new Set(facilities.map((facility) => facility.funder))].sort();
  const itl1Regions = [
    ...new Set(facilities.map((facility) => facility.location.itl1)),
  ].sort() as ITL1[];

  useEffect(() => {
    if (
      selectedSlug &&
      !filteredFacilities.some((facility) => facility.slug === selectedSlug)
    ) {
      setSelectedSlug(null);
    }
  }, [filteredFacilities, selectedSlug]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-12">
      <FilterBar
        funders={funders}
        itl1Regions={itl1Regions}
        onChange={setFilters}
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-600">
          Showing {filteredFacilities.length} of {facilities.length} facilities.
        </p>

        <div
          className="inline-flex rounded-full border border-stone-300 bg-white p-1 shadow-sm"
          role="tablist"
        >
          <ViewTab
            active={view === 'map'}
            label="Map"
            onClick={() => setView('map')}
          />
          <ViewTab
            active={view === 'list'}
            label="List"
            onClick={() => setView('list')}
          />
        </div>
      </div>

      <div className="mt-5">
        {view === 'map' ? (
          <MapView
            facilities={filteredFacilities}
            onSelect={setSelectedSlug}
            selectedSlug={selectedSlug}
          />
        ) : (
          <ListView facilities={filteredFacilities} onSelect={setSelectedSlug} />
        )}
      </div>

      <DetailPanel facility={selectedFacility} onClose={() => setSelectedSlug(null)} />
    </section>
  );
}

function ViewTab({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      aria-selected={active}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-ink text-white' : 'text-stone-700 hover:text-ink'
      }`}
      onClick={onClick}
      role="tab"
      type="button"
    >
      {label}
    </button>
  );
}
