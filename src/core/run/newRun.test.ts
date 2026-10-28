import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeRunStart, runStartArbitrary } from '../../../tests/builders';
import { GAME_DAY_MS } from '../constants';
import { assertStateIsValid } from './assertStateIsValid';
import { fingerprint } from './fingerprint';
import { newRun } from './newRun';
import { toRunSeed } from './runSeed';

describe('newRun', () => {
  it('gives two runs with structurally equal starts the same fingerprint', () => {
    fc.assert(
      fc.property(runStartArbitrary, (start) => {
        expect(fingerprint(newRun(start))).toBe(fingerprint(newRun(structuredClone(start))));
      }),
    );
  });

  it('starts at game time zero with an empty log and the first day boundary scheduled', () => {
    const state = newRun(makeRunStart());

    expect(state.nowGameMs).toBe(0);
    expect(state.inputLog).toEqual([]);
    expect(state.counters).toEqual({ event: 1 });
    expect(state.queue).toEqual([{ id: 'evt-000001', gameMs: GAME_DAY_MS, kind: 'dayBoundary' }]);
  });

  it('stores the start parameters in the state', () => {
    const start = makeRunStart({ loopNumber: 3, contentPackVersion: 'pack-z' });

    const state = newRun(start);

    expect(state.seed).toBe(start.seed);
    expect(state.loopNumber).toBe(3);
    expect(state.contentPackVersion).toBe('pack-z');
    expect(state.settings).toEqual(start.settings);
  });

  it('keeps extra fields of a decoded start out of the state', () => {
    const start = makeRunStart();
    const decoded = {
      ...start,
      stray: 'from an old save',
      settings: { ...start.settings, stray: 1 },
    };

    expect(Object.keys(newRun(decoded))).not.toContain('stray');
    expect(Object.keys(newRun(decoded).settings)).not.toContain('stray');
    expect(fingerprint(newRun(decoded))).toBe(fingerprint(newRun(start)));
  });

  it('produces only readonly plain data with safe integers (DET-06)', () => {
    fc.assert(
      fc.property(runStartArbitrary, (start) => {
        expect(() => {
          assertStateIsValid(newRun(start));
        }).not.toThrow();
      }),
    );
  });

  it('rejects a seed outside the Run ID range as a bug', () => {
    expect(() => toRunSeed(2 ** 30)).toThrow(/run seed/);
    expect(() => toRunSeed(-1)).toThrow(/run seed/);
    expect(() => toRunSeed(1.5)).toThrow(/run seed/);
  });
});
