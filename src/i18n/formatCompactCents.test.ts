import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { formatCompactCents } from './formatCompactCents';

const minus = '−';
const dollars = (amount: number): number => amount * 100;

describe('formatCompactCents', () => {
  it.each([
    [dollars(12_400), '$12,400'],
    [dollars(98_750), '$98,750'],
    [dollars(412_500), '$412.5K'],
    [dollars(12_400_000), '$12.4M'],
    [dollars(2_030_000_000), '$2.03B'],
    [dollars(-1_240), `${minus}$1,240`],
    [dollars(-412_500), `${minus}$412.5K`],
    [0, '$0'],
    [-0, '$0'],
    [-1, '$0'],
    [Number.MAX_SAFE_INTEGER, '$90.07T'],
  ])('renders %i cents as %s', (cents, expected) => {
    expect(formatCompactCents(cents)).toBe(expected);
  });

  it('shows full digits up to $99,999 and compact notation from $100,000', () => {
    expect(formatCompactCents(dollars(99_999))).toBe('$99,999');
    expect(formatCompactCents(dollars(100_000))).toBe('$100K');
    expect(formatCompactCents(dollars(-99_999))).toBe(`${minus}$99,999`);
    expect(formatCompactCents(dollars(-100_000))).toBe(`${minus}$100K`);
  });

  it('decides the threshold on the rounded dollars it shows', () => {
    expect(formatCompactCents(dollars(99_999) + 49)).toBe('$99,999');
    expect(formatCompactCents(dollars(99_999) + 50)).toBe('$100K');
  });

  it('rolls $999,995 over to $1M, never $1000K', () => {
    expect(formatCompactCents(dollars(999_950))).toBe('$999.95K');
    expect(formatCompactCents(dollars(999_995))).toBe('$1M');
  });

  it('treats non-integer cents as a bug', () => {
    expect(() => formatCompactCents(0.5)).toThrow(/integer cents/);
  });

  it('never shows a decimal point below $100,000 and always a suffix from $100,000', () => {
    fc.assert(
      fc.property(fc.maxSafeInteger(), (cents) => {
        const text = formatCompactCents(cents);
        expect(text).toMatch(new RegExp(`^${minus}?\\$`));
        expect(text).not.toMatch(/e|NaN|Infinity/);
        if (Math.abs(cents) < dollars(99_999)) expect(text).not.toContain('.');
        if (Math.abs(cents) >= dollars(100_000)) expect(text).toMatch(/[KMBT]$/);
      }),
    );
  });
});
