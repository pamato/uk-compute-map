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
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="rounded-[2rem] border border-stone-300 bg-white/88 p-5 shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Explore the map
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-700">
              Narrow the infrastructure landscape by category, status,
              geography, hardware, or funder while keeping the map in view.
            </p>

            <div className="mt-4 flex items-center justify-between gap-3 rounded-[1.25rem] border border-stone-200 bg-stone-50 px-4 py-3">
              <p className="text-sm text-stone-700">
                Showing <span className="font-semibold text-ink">{filteredFacilities.length}</span> of{' '}
                <span className="font-semibold text-ink">{facilities.length}</span>
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
          </div>

          <div className="mt-4">
            <FilterBar
              funders={funders}
              itl1Regions={itl1Regions}
              onChange={setFilters}
            />
          </div>
        </aside>

        <div className="min-w-0">
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
