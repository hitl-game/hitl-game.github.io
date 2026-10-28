import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { convertRealWindowToGameMs } from './convertRealWindowToGameMs';
import { gameSpeeds } from './gameSpeed';

describe('convertRealWindowToGameMs', () => {
  it('keeps a window as is at 1×', () => {
    expect(convertRealWindowToGameMs(45_000, 'full')).toBe(45_000);
  });

  it('halves a window at ½× and quarters it at ¼×', () => {
    expect(convertRealWindowToGameMs(45_000, 'half')).toBe(22_500);
    expect(convertRealWindowToGameMs(45_000, 'quarter')).toBe(11_250);
  });

  it('rounds half away from zero through divideRounded', () => {
    expect(convertRealWindowToGameMs(3, 'half')).toBe(2);
    expect(convertRealWindowToGameMs(5, 'quarter')).toBe(1);
    expect(convertRealWindowToGameMs(6, 'quarter')).toBe(2);
  });

  it('turns a zero window into zero game ms', () => {
    expect(Object.is(convertRealWindowToGameMs(0, 'quarter'), 0)).toBe(true);
  });

  it('stays exact for a large safe window', () => {
    const windowRealMs = Number.MAX_SAFE_INTEGER - 3;
    expect(convertRealWindowToGameMs(windowRealMs, 'quarter')).toBe(
      (Number.MAX_SAFE_INTEGER - 3) / 4,
    );
  });

  it('returns a safe integer that depends only on its arguments', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000 }),
        fc.constantFrom(...gameSpeeds),
        (windowRealMs, speed) => {
          const gameMs = convertRealWindowToGameMs(windowRealMs, speed);
          expect(Number.isSafeInteger(gameMs)).toBe(true);
          expect(convertRealWindowToGameMs(windowRealMs, speed)).toBe(gameMs);
        },
      ),
    );
  });
});
