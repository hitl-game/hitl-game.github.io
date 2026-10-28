import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { formatCents } from './formatCents';

const minus = '−';

describe('formatCents', () => {
  it.each([
    [1_240_000, '$12,400'],
    [9_875_000, '$98,750'],
    [41_250_000, '$412,500'],
    [-124_000, `${minus}$1,240`],
    [0, '$0'],
    [-0, '$0'],
    [1, '$0'],
    [-1, '$0'],
    [-49, '$0'],
    [50, '$1'],
    [-50, `${minus}$1`],
    [149, '$1'],
    [Number.MAX_SAFE_INTEGER, '$90,071,992,547,410'],
  ])('renders %i cents as %s', (cents, expected) => {
    expect(formatCents(cents)).toBe(expected);
  });

  it.each([0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1])(
    'treats %s cents as a bug',
    (cents) => {
      expect(() => formatCents(cents)).toThrow(/integer cents/);
    },
  );

  it('always shows a sign and a dollar sign, and never a decimal point', () => {
    fc.assert(
      fc.property(fc.maxSafeInteger(), (cents) => {
        const text = formatCents(cents);
        expect(text).toMatch(new RegExp(`^${minus}?\\$\\d{1,3}(,\\d{3})*$`));
      }),
    );
  });
});
