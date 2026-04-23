import { describe, expect, it } from 'vitest';

import {
  CHINA_EPOCH_FRONTIER_H100_EQUIVALENTS,
  COUNTRY_BENCHMARK,
  H100_SXM_FP8_TFLOPS_WITH_SPARSITY,
  US_EPOCH_FRONTIER_H100_EQUIVALENTS,
} from '@/data/countries';

const toAiExaflops = (h100Equivalents: number) =>
  Math.round((h100Equivalents * H100_SXM_FP8_TFLOPS_WITH_SPARSITY) / 1_000_000);

describe('COUNTRY_BENCHMARK', () => {
  it('derives the US frontier data-centre estimate from Epoch H100-equivalents', () => {
    const us = COUNTRY_BENCHMARK.find((country) => country.iso2 === 'US');

    expect(us?.publicAiExaflops).toBe(
      toAiExaflops(US_EPOCH_FRONTIER_H100_EQUIVALENTS),
    );
  });

  it('derives the China frontier data-centre estimate from Epoch H100-equivalents', () => {
    const china = COUNTRY_BENCHMARK.find((country) => country.iso2 === 'CN');

    expect(china?.publicAiExaflops).toBe(
      toAiExaflops(CHINA_EPOCH_FRONTIER_H100_EQUIVALENTS),
    );
  });

  it('keeps the UK current and target rows scoped separately', () => {
    const ukCurrent = COUNTRY_BENCHMARK.find((country) => country.iso2 === 'GB');
    const ukTarget = COUNTRY_BENCHMARK.find((country) => country.iso2 === 'GB-2030');

    expect(ukCurrent?.publicAiExaflops).toBe(22);
    expect(ukCurrent?.scope).toContain('public AI research compute');
    expect(ukTarget?.publicAiExaflops).toBe(420);
    expect(ukTarget?.scope).toContain('target');
  });
});
