import { describe, expect, it } from 'vitest';

import {
  applyFilters,
  filtersFromSearchParams,
  filtersToSearchParams,
  type FilterState,
} from '@/lib/filters';
import type { Facility } from '@/data/schema';

const makeFacility = (overrides: Partial<Facility>): Facility =>
  ({
    slug: 's',
    name: 'n',
    category: 'flagship',
    status: 'operational',
    location: {
      institution: 'i',
      city: 'c',
      nation: 'England',
      itl1: 'London',
      lat: 51,
      lon: -0.1,
    },
    operator: 'o',
    funder: 'UKRI',
    opened: '2025-01',
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
    aiExaflops: null,
    federationMembers: null,
    image: null,
    sources: [{ label: 'x', url: 'https://x.example' }],
    ...overrides,
  }) as Facility;

describe('applyFilters', () => {
  const facilities = [
    makeFacility({
      slug: 'a',
      category: 'flagship',
      status: 'operational',
      location: {
        institution: 'i',
        city: 'c',
        nation: 'England',
        itl1: 'London',
        lat: 51,
        lon: 0,
      },
      hardwareTags: ['nvidia-gpu'],
    }),
    makeFacility({
      slug: 'b',
      category: 'backbone',
      status: 'planned',
      location: {
        institution: 'i',
        city: 'c',
        nation: 'Scotland',
        itl1: 'Scotland',
        lat: 55,
        lon: -3,
      },
      hardwareTags: ['amd-gpu'],
    }),
    makeFacility({
      slug: 'c',
      category: 'specialist',
      status: 'upgrading',
      location: {
        institution: 'i',
        city: 'c',
        nation: 'Wales',
        itl1: 'Wales',
        lat: 51,
        lon: -3,
      },
      hardwareTags: ['cerebras', 'nvidia-gpu'],
    }),
  ];

  it('returns all facilities when no filters are active', () => {
    expect(applyFilters(facilities, {}).map((facility) => facility.slug)).toEqual([
      'a',
      'b',
      'c',
    ]);
  });

  it('filters by category', () => {
    expect(
      applyFilters(facilities, { categories: ['flagship'] }).map(
        (facility) => facility.slug,
      ),
    ).toEqual(['a']);
  });

  it('filters by multiple categories with OR logic inside the dimension', () => {
    expect(
      applyFilters(facilities, {
        categories: ['flagship', 'backbone'],
      }).map((facility) => facility.slug),
    ).toEqual(['a', 'b']);
  });

  it('filters by status and nation with AND logic across dimensions', () => {
    expect(
      applyFilters(facilities, {
        statuses: ['planned'],
        nations: ['Scotland'],
      }).map((facility) => facility.slug),
    ).toEqual(['b']);
  });

  it('filters by hardware tag using any-of matching', () => {
    expect(
      applyFilters(facilities, {
        hardwareTags: ['cerebras'],
      }).map((facility) => facility.slug),
    ).toEqual(['c']);
  });
});

describe('filter URL serialisation', () => {
  it('round-trips a complex filter state', () => {
    const state: FilterState = {
      categories: ['flagship', 'backbone'],
      statuses: ['operational'],
      nations: ['Scotland'],
      hardwareTags: ['nvidia-gpu'],
    };

    const params = filtersToSearchParams(state);
    expect(filtersFromSearchParams(params)).toEqual(state);
  });

  it('omits empty arrays from search params', () => {
    const state: FilterState = {
      categories: ['flagship'],
    };

    expect(filtersToSearchParams(state).toString()).toBe('category=flagship');
  });

  it('ignores unknown values gracefully', () => {
    const params = new URLSearchParams(
      'category=flagship,bogus&status=operational',
    );

    expect(filtersFromSearchParams(params)).toEqual({
      categories: ['flagship'],
      statuses: ['operational'],
    });
  });
});
