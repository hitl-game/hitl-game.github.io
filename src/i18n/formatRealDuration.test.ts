import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { formatRealDuration } from './formatRealDuration';

const toSeconds = (text: string): number => {
  const [minutes = '', seconds = ''] = text.split(':');
  return Number(minutes) * 60 + Number(seconds);
};

describe('formatRealDuration', () => {
  it.each([
    [41_000, '0:41'],
    [65_000, '1:05'],
    [720_000, '12:00'],
    [4_500_000, '75:00'],
    [0, '0:00'],
    [1, '0:01'],
    [40_001, '0:41'],
    [59_999.5, '1:00'],
    [-5_000, '0:00'],
  ])('renders %i ms as %s', (realMs, expected) => {
    expect(formatRealDuration(realMs)).toBe(expected);
  });

  it.each([Number.NaN, Number.POSITIVE_INFINITY])('treats %s ms as a bug', (realMs) => {
    expect(() => formatRealDuration(realMs)).toThrow(/finite/);
  });

  it('never shows less time for a longer duration', () => {
    const realMs = fc.integer({ min: -1_000, max: 10_000_000 });
    fc.assert(
      fc.property(realMs, realMs, (a, b) => {
        const [shorter, longer] = a <= b ? [a, b] : [b, a];
        expect(toSeconds(formatRealDuration(shorter))).toBeLessThanOrEqual(
          toSeconds(formatRealDuration(longer)),
        );
      }),
    );
  });
});
