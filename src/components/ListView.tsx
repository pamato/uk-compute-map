import type { Facility } from '../data/schema';
import { formatExaflops } from '../lib/format';
import { CategoryPill } from './CategoryPill';
import { StatusBadge } from './StatusBadge';

export function ListView({
  facilities,
  onSelect,
}: {
  facilities: Facility[];
  onSelect: (slug: string) => void;
}) {
  if (facilities.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-10 text-center text-sm text-stone-600">
        No facilities match the current filter combination.
      </div>
    );
  }

  return (
    <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {facilities.map((facility) => (
        <li key={facility.slug}>
          <button
            className="flex h-full w-full flex-col rounded-3xl border border-stone-300 bg-white p-5 text-left shadow-[0_20px_40px_-32px_rgba(24,24,24,0.55)] transition hover:-translate-y-0.5 hover:border-stone-500 focus:outline-none focus:ring-2 focus:ring-ink"
            onClick={() => onSelect(facility.slug)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-xl font-serif leading-tight">{facility.name}</h3>
              <StatusBadge status={facility.status} />
            </div>
            <p className="mt-2 text-sm text-stone-600">
              {facility.location.city}, {facility.location.nation}
            </p>
            <div className="mt-4">
              <CategoryPill category={facility.category} />
            </div>
            <p className="mt-4 flex-1 text-sm leading-relaxed text-stone-700">
              {facility.oneLiner}
            </p>
            <div className="mt-5 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-stone-500">
              <span>{facility.access.accessType}</span>
              <span>{formatExaflops(facility.aiExaflops)}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}
