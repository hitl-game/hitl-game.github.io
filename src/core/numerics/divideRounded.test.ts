import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { divideRounded } from './divideRounded';

describe('divideRounded', () => {
  it.each([
    [10, 5, 2],
    [-10, 5, -2],
    [10, -5, -2],
    [-10, -5, 2],
    [1, 3, 0],
    [2, 3, 1],
    [-1, 3, 0],
    [-2, 3, -1],
    [7, 2, 4],
    [-7, 2, -4],
    [7, -2, -4],
    [-7, -2, 4],
    [5, 10, 1],
    [-5, 10, -1],
    [0, 7, 0],
    [0, -7, 0],
  ])('rounds %i / %i half away from zero to %i', (numerator, denominator, expected) => {
    expect(divideRounded(numerator, denominator)).toBe(expected);
  });

  it('returns a canonical zero, never a negative zero', () => {
    expect(Object.is(divideRounded(0, -5), 0)).toBe(true);
    expect(Object.is(divideRounded(2, -5), 0)).toBe(true);
  });

  it('treats a zero denominator as a bug', () => {
    expect(() => divideRounded(1, 0)).toThrow(/divides by zero/);
  });

  it('treats non-integer operands as a bug', () => {
    expect(() => divideRounded(1.5, 1)).toThrow(/safe integers/);
    expect(() => divideRounded(1, Number.NaN)).toThrow(/safe integers/);
  });

  it('breaks exact halves away from zero', () => {
    const operand = fc.integer({ min: -1_000_000, max: 1_000_000 });
    fc.assert(
      fc.property(operand, fc.boolean(), (half, negativeDenominator) => {
        const denominator = negativeDenominator ? -2 : 2;
        const numerator = 2 * half + 1;

        const quotient = divideRounded(numerator, denominator);

        expect(Math.abs(quotient * denominator)).toBeGreaterThan(Math.abs(numerator));
      }),
    );
  });

  it('never lands more than half a denominator away from the exact quotient', () => {
    const operand = fc.integer({ min: -1_000_000, max: 1_000_000 });
    fc.assert(
      fc.property(
        operand,
        operand.filter((value) => value !== 0),
        (numerator, denominator) => {
          const quotient = divideRounded(numerator, denominator);
          const twiceError = Math.abs(2 * (quotient * denominator - numerator));

          expect(Number.isSafeInteger(quotient)).toBe(true);
          expect(twiceError).toBeLessThanOrEqual(Math.abs(denominator));
        },
      ),
    );
  });
});
