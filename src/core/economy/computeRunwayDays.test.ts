import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeEconomyTuning, makeState } from '../../../tests/builders';
import { computeDailyBurnCents } from './computeDailyBurnCents';
import { computeRunwayDays } from './computeRunwayDays';

const tuning = makeEconomyTuning();

describe('computeRunwayDays', () => {
  it('leaves 31 days of runway at the Garage burn from the canonical start (ECO-02)', () => {
    expect(computeRunwayDays(makeState(), tuning)).toEqual({ kind: 'days', days: 31 });
  });

  it('floors to whole days: one cent short of a day is zero days, a full burn is one', () => {
    expect(computeRunwayDays(makeState({ cashCents: 39_999 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
    expect(computeRunwayDays(makeState({ cashCents: 40_000 }), tuning)).toEqual({
      kind: 'days',
      days: 1,
    });
    expect(computeRunwayDays(makeState({ cashCents: 80_001 }), tuning)).toEqual({
      kind: 'days',
      days: 2,
    });
  });

  it('is zero days with no cash, and clamped to zero in an overdraft', () => {
    expect(computeRunwayDays(makeState({ cashCents: 0 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
    expect(computeRunwayDays(makeState({ cashCents: -1 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
    expect(computeRunwayDays(makeState({ cashCents: -500_000 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
  });

  it('reports no burn, not infinite days, when nothing costs anything', () => {
    const free = makeEconomyTuning({
      'phases.garage.baseCostsPerDayUsd': 0,
      'phases.garage.gpuUnitCostPerDayUsd': 0,
    });

    expect(computeRunwayDays(makeState({ gpuCapacityUnits: 0 }), free)).toEqual({
      kind: 'noBurn',
    });
    expect(computeRunwayDays(makeState({ cashCents: -1 }), free)).toEqual({ kind: 'noBurn' });
  });

  it('ignores revenue: runway is cash over burn, as the GDD defines it', () => {
    expect(computeRunwayDays(makeState({ mrrCents: 3_000_000 }), tuning)).toEqual({
      kind: 'days',
      days: 31,
    });
  });

  it('never returns a float or a negative day count', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -10_000_000, max: 10_000_000 }),
        fc.integer({ min: 0, max: 100 }),
        (cashCents, gpuCapacityUnits) => {
          const state = makeState({ cashCents, gpuCapacityUnits });

          const runway = computeRunwayDays(state, tuning);

          expect(runway.kind).toBe('days');
          if (runway.kind !== 'days') return;
          const burn = computeDailyBurnCents(state, tuning);
          expect(Number.isSafeInteger(runway.days)).toBe(true);
          expect(runway.days).toBeGreaterThanOrEqual(0);
          expect(runway.days * burn).toBeLessThanOrEqual(Math.max(cashCents, 0));
          expect((runway.days + 1) * burn).toBeGreaterThan(Math.max(cashCents, 0));
        },
      ),
    );
  });
});
