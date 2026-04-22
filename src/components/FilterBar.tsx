import { useEffect, useState } from 'react';

import type {
  AccessType,
  Category,
  HardwareTag,
  ITL1,
  Nation,
  Status,
} from '../data/schema';
import {
  filtersFromSearchParams,
  filtersToSearchParams,
  type FilterState,
} from '../lib/filters';

const CATEGORIES: Category[] = [
  'flagship',
  'backbone',
  'specialist',
  'regional',
  'mission',
];

const STATUSES: Status[] = [
  'operational',
  'upgrading',
  'planned',
  'decommissioned',
];

const NATIONS: Nation[] = ['England', 'Scotland', 'Wales', 'Northern Ireland'];

const ACCESS_TYPES: AccessType[] = [
  'public-application',
  'federated',
  'restricted',
  'commercial',
];

const HARDWARE_TAGS: HardwareTag[] = [
  'nvidia-gpu',
  'amd-gpu',
  'intel-gpu',
  'grace-hopper',
  'cerebras',
  'cpu-only',
  'cloud',
];

const CATEGORY_LABEL: Record<Category, string> = {
  flagship: 'Flagship AI',
  backbone: 'National backbone',
  specialist: 'Specialist platform',
  regional: 'Regional system',
  mission: 'Mission compute',
};

const STATUS_LABEL: Record<Status, string> = {
  operational: 'Operational',
  upgrading: 'Upgrading',
  planned: 'Planned',
  decommissioned: 'Decommissioned',
};

const ACCESS_LABEL: Record<AccessType, string> = {
  'public-application': 'Public application',
  federated: 'Federated',
  restricted: 'Restricted',
  commercial: 'Commercial',
};

const HARDWARE_LABEL: Record<HardwareTag, string> = {
  'nvidia-gpu': 'NVIDIA GPU',
  'amd-gpu': 'AMD GPU',
  'intel-gpu': 'Intel GPU',
  'grace-hopper': 'Grace Hopper',
  cerebras: 'Cerebras',
  'cpu-only': 'CPU only',
  cloud: 'Cloud',
};

export interface FilterBarProps {
  funders: string[];
  itl1Regions: ITL1[];
  onChange: (state: FilterState) => void;
}

export function FilterBar({
  funders,
  itl1Regions,
  onChange,
}: FilterBarProps) {
  const [state, setState] = useState<FilterState>(() => {
    if (typeof window === 'undefined') {
      return {};
    }

    return filtersFromSearchParams(new URLSearchParams(window.location.search));
  });
  const [advancedOpen, setAdvancedOpen] = useState(false);

  useEffect(() => {
    onChange(state);

    if (typeof window === 'undefined') {
      return;
    }

    const params = filtersToSearchParams(state);
    const query = params.toString();
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    window.history.replaceState(null, '', url);
  }, [onChange, state]);

  return (
    <div className="rounded-[2rem] border border-stone-300 bg-white/90 p-5 shadow-[0_28px_60px_-40px_rgba(20,20,20,0.5)] backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Filter the map
          </p>
          <p className="mt-2 max-w-2xl text-sm text-stone-700">
            Combine category, status, and geography to isolate the parts of the
            UK's public compute landscape that matter for a specific policy or
            investment question.
          </p>
        </div>
        {hasActiveFilters(state) ? (
          <button
            className="rounded-full border border-stone-300 px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:border-ink hover:text-ink"
            onClick={() => setState({})}
            type="button"
          >
            Clear all
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-3">
        <FilterGroup label="Category">
          {CATEGORIES.map((category) => (
            <Chip
              active={state.categories?.includes(category) ?? false}
              key={category}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  categories: toggle(current.categories, category),
                }))
              }
            >
              {CATEGORY_LABEL[category]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Status">
          {STATUSES.map((status) => (
            <Chip
              active={state.statuses?.includes(status) ?? false}
              key={status}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  statuses: toggle(current.statuses, status),
                }))
              }
            >
              {STATUS_LABEL[status]}
            </Chip>
          ))}
        </FilterGroup>

        <FilterGroup label="Nation">
          {NATIONS.map((nation) => (
            <Chip
              active={state.nations?.includes(nation) ?? false}
              key={nation}
              onClick={() =>
                setState((current) => ({
                  ...current,
                  nations: toggle(current.nations, nation),
                }))
              }
            >
              {nation}
            </Chip>
          ))}
        </FilterGroup>
      </div>

      <button
        aria-expanded={advancedOpen}
        className="mt-5 text-sm font-medium text-stone-700 underline decoration-stone-400 underline-offset-4 transition hover:text-ink hover:decoration-ink"
        onClick={() => setAdvancedOpen((open) => !open)}
        type="button"
      >
        {advancedOpen ? 'Hide advanced filters' : 'Show advanced filters'}
      </button>

      {advancedOpen ? (
        <div className="mt-5 grid gap-4 border-t border-stone-200 pt-5 lg:grid-cols-2">
          <FilterGroup label="Access">
            {ACCESS_TYPES.map((accessType) => (
              <Chip
                active={state.accessTypes?.includes(accessType) ?? false}
                key={accessType}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    accessTypes: toggle(current.accessTypes, accessType),
                  }))
                }
              >
                {ACCESS_LABEL[accessType]}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Hardware">
            {HARDWARE_TAGS.map((hardwareTag) => (
              <Chip
                active={state.hardwareTags?.includes(hardwareTag) ?? false}
                key={hardwareTag}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    hardwareTags: toggle(current.hardwareTags, hardwareTag),
                  }))
                }
              >
                {HARDWARE_LABEL[hardwareTag]}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="ITL1 region">
            {itl1Regions.map((region) => (
              <Chip
                active={state.itl1?.includes(region) ?? false}
                key={region}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    itl1: toggle(current.itl1, region),
                  }))
                }
              >
                {region}
              </Chip>
            ))}
          </FilterGroup>

          <FilterGroup label="Funder">
            {funders.map((funder) => (
              <Chip
                active={state.funders?.includes(funder) ?? false}
                key={funder}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    funders: toggle(current.funders, funder),
                  }))
                }
              >
                {funder}
              </Chip>
            ))}
          </FilterGroup>
        </div>
      ) : null}
    </div>
  );
}

function hasActiveFilters(state: FilterState) {
  return Object.values(state).some(
    (value) => Array.isArray(value) && value.length > 0,
  );
}

function toggle<T>(values: T[] | undefined, value: T): T[] {
  const next = new Set(values ?? []);

  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }

  return [...next];
}

function FilterGroup({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <fieldset>
      <legend className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
        {label}
      </legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-ink ${
        active
          ? 'border-ink bg-ink text-white'
          : 'border-stone-300 bg-white text-stone-700 hover:border-stone-500 hover:text-ink'
      }`}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
