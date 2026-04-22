import { describe, expect, it } from 'vitest';

import {
  buildTrajectorySeries,
  TARGET_2030_EXAFLOPS,
} from '@/lib/trajectory';
import type { Facility } from '@/data/schema';

const makeFacility = (
  slug: string,
  opened: string | null,
  aiExaflops: number | null,
  status: Facility['status'] = 'operational',
): Facility => ({
  slug,
  name: slug,
  category: 'flagship',
  status,
  location: {
    institution: 'i',
    city: 'c',
    nation: 'England',
    itl1: 'London',
    lat: 51,
    lon: 0,
  },
  operator: 'o',
  funder: 'f',
  opened,
  decommissioned: null,
  oneLiner: 'x',
  summary: 'x',
  keyFacts: {
    hardware: 'x',
    performance: 'x',
    funding: 'x',
    energy: 'x',
  },
  access: {
    route: 'x',
    accessType: 'public-application',
  },
  useCases: ['x'],
  hardwareTags: ['nvidia-gpu'],
  aiExaflops,
  federationMembers: null,
  image: null,
  sources: [{ label: 'x', url: 'https://x.example' }],
});

describe('buildTrajectorySeries', () => {
  it('accumulates quantified AI-exaflops by year', () => {
    const facilities = [
      makeFacility('a', '2024-06', 5),
      makeFacility('b', '2025-07', 21),
      makeFacility('c', '2026-03', 6),
    ];

    expect(
      buildTrajectorySeries(facilities, {
        startYear: 2023,
        endYear: 2027,
      }),
    ).toEqual([
      { year: 2023, cumulative: 0, target: null },
      { year: 2024, cumulative: 5, target: null },
      { year: 2025, cumulative: 26, target: null },
      { year: 2026, cumulative: 32, target: null },
      { year: 2027, cumulative: 32, target: null },
    ]);
  });

  it('ignores facilities without an AI-exaflops figure', () => {
    const facilities = [
      makeFacility('a', '2024-06', null),
      makeFacility('b', '2025-07', 21),
    ];

    expect(
      buildTrajectorySeries(facilities, {
        startYear: 2024,
        endYear: 2025,
      }),
    ).toEqual([
      { year: 2024, cumulative: 0, target: null },
      { year: 2025, cumulative: 21, target: null },
    ]);
  });

  it('marks the 2030 target point', () => {
    const series = buildTrajectorySeries([], {
      startYear: 2028,
      endYear: 2030,
    });

    expect(series.at(-1)).toEqual({
      year: 2030,
      cumulative: 0,
      target: TARGET_2030_EXAFLOPS,
    });
    expect(TARGET_2030_EXAFLOPS).toBe(420);
  });
});
