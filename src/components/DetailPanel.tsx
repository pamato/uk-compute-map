import { useEffect, useRef } from 'react';

import type { Facility } from '../data/schema';
import { formatExaflops, formatYearMonth } from '../lib/format';
import { CategoryPill } from './CategoryPill';
import { Sources } from './Sources';
import { StatusBadge } from './StatusBadge';

export interface DetailPanelProps {
  facility: Facility | null;
  onClose: () => void;
}

export function DetailPanel({ facility, onClose }: DetailPanelProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!facility) {
      return;
    }

    closeButtonRef.current?.focus();
  }, [facility]);

  useEffect(() => {
    if (!facility) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [facility, onClose]);

  if (!facility) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-stone-950/30 backdrop-blur-[2px]">
      <button
        aria-label="Close details"
        className="h-full flex-1 cursor-default"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-labelledby="detail-panel-title"
        className="h-full w-full max-w-xl overflow-y-auto border-l border-stone-300 bg-white px-6 py-8 shadow-2xl"
        role="dialog"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Facility detail
            </p>
            <h2 className="mt-2 text-3xl font-serif" id="detail-panel-title">
              {facility.name}
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {facility.location.institution}, {facility.location.city},{' '}
              {facility.location.nation}
            </p>
          </div>
          <button
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-ink hover:text-ink"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            Close
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <CategoryPill category={facility.category} />
          <StatusBadge status={facility.status} />
        </div>

        <p className="mt-5 text-lg leading-relaxed text-stone-800">
          {facility.oneLiner}
        </p>

        <dl className="mt-8 grid gap-4 rounded-3xl border border-stone-200 bg-stone-50 p-5 text-sm sm:grid-cols-2">
          <Fact label="Hardware" value={facility.keyFacts.hardware} />
          <Fact label="Performance" value={facility.keyFacts.performance} />
          <Fact label="AI-exaflops" value={formatExaflops(facility.aiExaflops)} />
          <Fact label="Funding" value={facility.keyFacts.funding} />
          <Fact label="Energy" value={facility.keyFacts.energy} />
          <Fact label="Opened" value={formatYearMonth(facility.opened)} />
          <Fact label="Operator" value={facility.operator} />
          <Fact label="Funder" value={facility.funder} />
        </dl>

        <section className="mt-8">
          <h3 className="font-serif text-xl">Overview</h3>
          <p className="mt-3 leading-relaxed text-stone-700">
            {facility.summary}
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-serif text-xl">Access</h3>
          <p className="mt-3 text-sm leading-relaxed text-stone-700">
            {facility.access.route}
          </p>
          <p className="mt-2 text-xs uppercase tracking-[0.16em] text-stone-500">
            Access type: {facility.access.accessType}
          </p>
        </section>

        <section className="mt-8">
          <h3 className="font-serif text-xl">Use cases</h3>
          <ul className="mt-3 space-y-2 text-sm text-stone-700">
            {facility.useCases.map((useCase) => (
              <li key={useCase} className="flex gap-2">
                <span className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-stone-500" />
                <span>{useCase}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-8">
          <h3 className="font-serif text-xl">Sources</h3>
          <div className="mt-3">
            <Sources sources={facility.sources} />
          </div>
        </section>

        <a
          className="mt-8 inline-flex items-center rounded-full border border-ink px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          href={`/facilities/${facility.slug}`}
        >
          Read full profile
        </a>
      </aside>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-relaxed text-stone-800">{value}</dd>
    </div>
  );
}
