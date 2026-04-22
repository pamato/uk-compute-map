import { describe, expect, it } from 'vitest';

import { loadFacilities } from '@/lib/load-facilities';

describe('loadFacilities', () => {
  it('loads and validates the real facility JSONs', async () => {
    const facilities = await loadFacilities();

    expect(facilities.length).toBeGreaterThan(0);

    const slugs = facilities.map((facility) => facility.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain('isambard-ai');
  });

  it('sorts facilities by name', async () => {
    const facilities = await loadFacilities();
    const names = facilities.map((facility) => facility.name);

    expect(names).toEqual(
      [...names].sort((left, right) => left.localeCompare(right)),
    );
  });

  it('every facility has at least one source', async () => {
    const facilities = await loadFacilities();

    for (const facility of facilities) {
      expect(
        facility.sources.length,
        `${facility.slug} should have at least one source`,
      ).toBeGreaterThan(0);
    }
  });

  it('every quantified facility is operational or upgrading', async () => {
    const facilities = await loadFacilities();

    for (const facility of facilities) {
      if (facility.aiExaflops && facility.aiExaflops > 0) {
        expect(['operational', 'upgrading']).toContain(facility.status);
      }
    }
  });
});
