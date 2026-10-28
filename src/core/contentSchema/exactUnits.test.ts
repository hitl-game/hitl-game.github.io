import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  activeMinutesToGameMs,
  alignmentPointsToMilli,
  daysToGameMs,
  hypeIndexToBp,
  multiplierToBp,
  percentToBp,
  secondsToGameMs,
  secondsToRealMs,
  toMilli,
  usdToCents,
  type Conversion,
} from './exactUnits';

const valueOf = (conversion: Conversion): number => {
  if (!conversion.ok) throw new Error(conversion.error.reason);
  return conversion.value;
};

const reasonOf = (conversion: Conversion): string =>
  conversion.ok ? `converted to ${String(conversion.value)}` : conversion.error.reason;

describe('exact unit conversion', () => {
  it.each([
    { name: 'usdToCents', convert: usdToCents, value: 12_400, expected: 1_240_000 },
    { name: 'usdToCents', convert: usdToCents, value: -5_000, expected: -500_000 },
    { name: 'percentToBp', convert: percentToBp, value: 0.1, expected: 10 },
    { name: 'percentToBp', convert: percentToBp, value: 0.5, expected: 50 },
    { name: 'hypeIndexToBp', convert: hypeIndexToBp, value: 20, expected: 2_000 },
    {
      name: 'alignmentPointsToMilli',
      convert: alignmentPointsToMilli,
      value: -0.02,
      expected: -20,
    },
    {
      name: 'alignmentPointsToMilli',
      convert: alignmentPointsToMilli,
      value: -0.1,
      expected: -100,
    },
    { name: 'daysToGameMs', convert: daysToGameMs, value: 0.5, expected: 30_000 },
    { name: 'daysToGameMs', convert: daysToGameMs, value: 10, expected: 600_000 },
    { name: 'secondsToRealMs', convert: secondsToRealMs, value: 10, expected: 10_000 },
    { name: 'secondsToGameMs', convert: secondsToGameMs, value: 30, expected: 30_000 },
    { name: 'activeMinutesToGameMs', convert: activeMinutesToGameMs, value: 3, expected: 180_000 },
    { name: 'multiplierToBp', convert: multiplierToBp, value: 1.5, expected: 15_000 },
    { name: 'multiplierToBp', convert: multiplierToBp, value: 0.6, expected: 6_000 },
    { name: 'toMilli', convert: toMilli, value: 0.5, expected: 500 },
  ])('$name converts $value to $expected', ({ convert, value, expected }) => {
    expect(valueOf(convert(value))).toBe(expected);
  });

  it.each([
    [0.07, 7],
    [1.15, 115],
    [4.35, 435],
  ])('converts the float trap %d dollars to exactly %d cents', (dollars, cents) => {
    expect(valueOf(usdToCents(dollars))).toBe(cents);
  });

  it.each([
    [0.001, '0.001 is not a whole number of cents'],
    [0.1 + 0.2, '0.30000000000000004 has too many digits to convert exactly'],
    [1e-7, '1e-7 needs exponent notation; write it in cents'],
    [1e21, '1e+21 needs exponent notation; write it in cents'],
    [Number.NaN, 'NaN is not a finite number'],
    [Number.POSITIVE_INFINITY, 'Infinity is not a finite number'],
    [Number.MAX_SAFE_INTEGER, `${String(Number.MAX_SAFE_INTEGER)} is too large to store in cents`],
  ])('rejects %d dollars', (dollars, reason) => {
    expect(reasonOf(usdToCents(dollars))).toBe(reason);
  });

  it('rejects a value that rounds in the integer unit', () => {
    expect(reasonOf(percentToBp(0.125))).toBe('0.125 is not a whole number of basis points');
    expect(reasonOf(alignmentPointsToMilli(0.0005))).toBe(
      '0.0005 is not a whole number of milli-points',
    );
  });

  it('returns a canonical zero for a negative zero', () => {
    expect(Object.is(valueOf(usdToCents(-0)), 0)).toBe(true);
    expect(Object.is(valueOf(percentToBp(-0)), 0)).toBe(true);
  });

  it('converts the shortest decimal text of any whole number of cents back to it', () => {
    const cents = fc.integer({ min: -999_999_999_999_999, max: 999_999_999_999_999 });
    fc.assert(
      fc.property(cents, (count) => {
        expect(valueOf(usdToCents(count / 100))).toBe(count);
      }),
    );
  });
});
