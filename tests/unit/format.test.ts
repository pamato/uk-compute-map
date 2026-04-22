import { describe, expect, it } from 'vitest';

import {
  categoryLabel,
  formatExaflops,
  formatYearMonth,
  statusLabel,
} from '@/lib/format';

describe('formatExaflops', () => {
  it('formats whole numbers', () => {
    expect(formatExaflops(21)).toBe('21 AI-exaflops');
  });

  it('formats sub-exaflop values with one decimal place', () => {
    expect(formatExaflops(0.3)).toBe('0.3 AI-exaflops');
  });

  it('returns a placeholder for null values', () => {
    expect(formatExaflops(null)).toBe('Not comparable');
  });
});

describe('formatYearMonth', () => {
  it('formats YYYY-MM as Month YYYY', () => {
    expect(formatYearMonth('2025-07')).toBe('July 2025');
  });

  it('returns an em dash for null', () => {
    expect(formatYearMonth(null)).toBe('—');
  });
});

describe('statusLabel', () => {
  it('maps status enums to human labels', () => {
    expect(statusLabel('operational')).toBe('Operational');
    expect(statusLabel('upgrading')).toBe('Upgrading');
    expect(statusLabel('planned')).toBe('Planned');
    expect(statusLabel('decommissioned')).toBe('Decommissioned');
  });
});

describe('categoryLabel', () => {
  it('maps category enums to human labels', () => {
    expect(categoryLabel('flagship')).toBe('Flagship AI supercomputer');
    expect(categoryLabel('backbone')).toBe('National HPC backbone');
    expect(categoryLabel('specialist')).toBe('Specialist AI & data platform');
    expect(categoryLabel('regional')).toBe('Regional research system');
    expect(categoryLabel('mission')).toBe('Mission-specific compute');
  });
});
