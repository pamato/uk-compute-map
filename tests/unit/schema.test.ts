import { describe, expect, it } from 'vitest';

import { FacilitySchema } from '@/data/schema';

const valid = {
  slug: 'isambard-ai',
  name: 'Isambard-AI',
  category: 'flagship',
  status: 'operational',
  location: {
    institution: 'National Composites Centre',
    city: 'Bristol',
    nation: 'England',
    itl1: 'South West',
    lat: 51.5227,
    lon: -2.5878,
  },
  operator: 'University of Bristol & HPE',
  funder: 'UKRI / DSIT',
  opened: '2025-07',
  decommissioned: null,
  oneLiner: 'Flagship UK AI supercomputer, half of the AIRR.',
  summary: 'Isambard-AI is the UK flagship AI supercomputer...',
  keyFacts: {
    hardware: '5,448 NVIDIA GH200 Grace-Hopper',
    performance: '≈21 AI-exaflops',
    funding: '£225m',
    energy: 'Renewable; fan-less liquid cooling',
  },
  access: {
    route: 'Free to UK researchers via UKRI',
    accessType: 'public-application',
  },
  useCases: ['LLM inference', 'Generative AI for public-sector'],
  hardwareTags: ['nvidia-gpu', 'grace-hopper'],
  aiExaflops: 21,
  federationMembers: null,
  image: null,
  sources: [{ label: 'UKRI', url: 'https://www.ukri.org/' }],
};

describe('FacilitySchema', () => {
  it('accepts a fully valid facility', () => {
    expect(() => FacilitySchema.parse(valid)).not.toThrow();
  });

  it('rejects an unknown category', () => {
    expect(() =>
      FacilitySchema.parse({ ...valid, category: 'other' }),
    ).toThrow();
  });

  it('rejects an unknown status', () => {
    expect(() =>
      FacilitySchema.parse({ ...valid, status: 'future' }),
    ).toThrow();
  });

  it('rejects lat outside [-90, 90]', () => {
    expect(() =>
      FacilitySchema.parse({
        ...valid,
        location: { ...valid.location, lat: 99 },
      }),
    ).toThrow();
  });

  it('rejects invalid URL in sources', () => {
    expect(() =>
      FacilitySchema.parse({
        ...valid,
        sources: [{ label: 'x', url: 'not-a-url' }],
      }),
    ).toThrow();
  });

  it('rejects invalid opened date format', () => {
    expect(() =>
      FacilitySchema.parse({ ...valid, opened: '2025/07' }),
    ).toThrow();
  });

  it('requires image credit when image present', () => {
    expect(() =>
      FacilitySchema.parse({
        ...valid,
        image: {
          url: 'https://x/y.jpg',
          credit: '',
          licence: 'CC-BY',
          source: 'Wikimedia',
        },
      }),
    ).toThrow();
  });
});
