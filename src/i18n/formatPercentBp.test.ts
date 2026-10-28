import { describe, expect, it } from 'vitest';

import { formatPercentBp } from './formatPercentBp';

describe('formatPercentBp', () => {
  it.each([
    [1, '0.01%'],
    [5, '0.05%'],
    [10, '0.1%'],
    [50, '0.5%'],
    [200, '2%'],
    [1_234, '12.34%'],
    [10_000, '100%'],
    [25_000, '250%'],
    [0, '0%'],
    [-0, '0%'],
    [-50, '−0.5%'],
    [Number.MAX_SAFE_INTEGER, '90,071,992,547,409.91%'],
  ])('renders %i bp as %s', (bp, expected) => {
    expect(formatPercentBp(bp)).toBe(expected);
  });

  it('treats non-integer basis points as a bug', () => {
    expect(() => formatPercentBp(1.5)).toThrow(/integer bp/);
  });
});
