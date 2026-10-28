import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeEconomyTuning, makeRunStart, runStartArbitrary } from '../../../tests/builders';
import { GAME_DAY_MS } from '../constants';
import { assertStateIsValid } from './assertStateIsValid';
import { fingerprint } from './fingerprint';
import { newRun } from './newRun';
import { toRunSeed } from './runSeed';

const tuning = makeEconomyTuning();

describe('newRun', () => {
  it('gives two runs with structurally equal starts the same fingerprint', () => {
    fc.assert(
      fc.property(runStartArbitrary, (start) => {
        expect(fingerprint(newRun(start, tuning))).toBe(
          fingerprint(newRun(structuredClone(start), tuning)),
        );
      }),
    );
  });

  it('starts at game time zero with an empty log and both daily events scheduled a day out', () => {
    const state = newRun(makeRunStart(), tuning);

    expect(state.nowGameMs).toBe(0);
    expect(state.inputLog).toEqual([]);
    expect(state.counters).toEqual({ event: 2 });
    expect(state.queue).toEqual([
      { id: 'evt-000001', gameMs: GAME_DAY_MS, kind: 'dayBoundary' },
      { id: 'evt-000002', gameMs: GAME_DAY_MS, kind: 'economyStep' },
    ]);
  });

  it('starts from the canonical table: cash, Hype, Alignment, Garage, one GPU, no revenue (ECO-01)', () => {
    const state = newRun(makeRunStart(), tuning);

    expect(state.cashCents).toBe(1_240_000);
    expect(state.hypeBp).toBe(2_000);
    expect(state.alignmentMilli).toBe(100_000);
    expect(state.phase).toBe('garage');
    expect(state.gpuCapacityUnits).toBe(1);
    expect(state.mrrCents).toBe(0);
    expect(state.customerCount).toBe(0);
  });

  it('takes the start values from the tuning it is given, not from constants', () => {
    const state = newRun(
      makeRunStart(),
      makeEconomyTuning({
        'start.cashUsd': 500,
        'start.hypeIndex': 7,
        'start.alignmentPoints': 42,
        'start.gpuCapacityUnits': 4,
      }),
    );

    expect(state.cashCents).toBe(50_000);
    expect(state.hypeBp).toBe(700);
    expect(state.alignmentMilli).toBe(42_000);
    expect(state.gpuCapacityUnits).toBe(4);
  });

  it('stores the start parameters in the state', () => {
    const start = makeRunStart({ loopNumber: 3, contentPackVersion: 'pack-z' });

    const state = newRun(start, tuning);

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

    expect(Object.keys(newRun(decoded, tuning))).not.toContain('stray');
    expect(Object.keys(newRun(decoded, tuning).settings)).not.toContain('stray');
    expect(fingerprint(newRun(decoded, tuning))).toBe(fingerprint(newRun(start, tuning)));
  });

  it('produces only readonly plain data with safe integers (DET-06)', () => {
    fc.assert(
      fc.property(runStartArbitrary, (start) => {
        expect(() => {
          assertStateIsValid(newRun(start, tuning));
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
