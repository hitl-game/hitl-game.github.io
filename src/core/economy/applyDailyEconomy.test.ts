import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeEconomyTuning, makeState } from '../../../tests/builders';
import { divideRounded } from '../numerics';
import { applyDailyEconomy } from './applyDailyEconomy';
import { computeDailyBurnCents } from './computeDailyBurnCents';
import { computeDailyRevenueCents } from './computeDailyRevenueCents';

const tuning = makeEconomyTuning();
const billingMonthDays = 30;

describe('computeDailyBurnCents', () => {
  it('burns $400 a day in the Garage with one GPU unit: base costs plus compute', () => {
    expect(computeDailyBurnCents(makeState(), tuning)).toBe(40_000);
  });

  it('adds one unit cost per GPU unit', () => {
    expect(computeDailyBurnCents(makeState({ gpuCapacityUnits: 3 }), tuning)).toBe(
      40_000 + 2 * 5_000,
    );
  });

  it('burns base costs only with no GPU units', () => {
    expect(computeDailyBurnCents(makeState({ gpuCapacityUnits: 0 }), tuning)).toBe(35_000);
  });

  it('reads the costs of the current phase', () => {
    expect(computeDailyBurnCents(makeState({ phase: 'seed' }), tuning)).toBe(150_000 + 5_000);
  });

  it('comes from tuning, not from code', () => {
    const dearer = makeEconomyTuning({
      'phases.garage.baseCostsPerDayUsd': 500,
      'phases.garage.gpuUnitCostPerDayUsd': 75,
    });

    expect(computeDailyBurnCents(makeState(), dearer)).toBe(57_500);
  });
});

describe('computeDailyRevenueCents', () => {
  it('is nothing without MRR', () => {
    expect(computeDailyRevenueCents(makeState(), tuning)).toBe(0);
  });

  it('is MRR over the billing month: 3,000,000 cents a month is 100,000 a day', () => {
    expect(computeDailyRevenueCents(makeState({ mrrCents: 3_000_000 }), tuning)).toBe(100_000);
  });

  it.each([1_015, 1_014, 1_004, 15, 45, 44])(
    'rounds MRR %i half away from zero like divideRounded',
    (mrrCents) => {
      expect(computeDailyRevenueCents(makeState({ mrrCents }), tuning)).toBe(
        divideRounded(mrrCents, billingMonthDays),
      );
    },
  );

  it('rounds an exact half up, and just under it down', () => {
    expect(computeDailyRevenueCents(makeState({ mrrCents: 1_015 }), tuning)).toBe(34);
    expect(computeDailyRevenueCents(makeState({ mrrCents: 1_014 }), tuning)).toBe(34);
    expect(computeDailyRevenueCents(makeState({ mrrCents: 1_004 }), tuning)).toBe(33);
  });

  it('stays a safe integer at the largest MRR the state can hold', () => {
    const mrrCents = Number.MAX_SAFE_INTEGER;

    const revenue = computeDailyRevenueCents(makeState({ mrrCents }), tuning);

    expect(Number.isSafeInteger(revenue)).toBe(true);
    expect(revenue).toBe(divideRounded(mrrCents, billingMonthDays));
  });

  it('follows the billing month from tuning', () => {
    const longMonth = makeEconomyTuning({ 'economy.billingMonthDays': 60 });

    expect(computeDailyRevenueCents(makeState({ mrrCents: 3_000_000 }), longMonth)).toBe(50_000);
  });

  it('treats a billing month that is not a whole number of game days as a bug', () => {
    const broken = {
      ...tuning,
      economy: { ...tuning.economy, billingMonthGameMs: 90_000 },
    };

    expect(() => computeDailyRevenueCents(makeState(), broken)).toThrow(
      /whole number of game days/,
    );
  });
});

describe('applyDailyEconomy', () => {
  it('takes one day of burn from a Garage start and reports the change', () => {
    const state = makeState();

    const applied = applyDailyEconomy(state, tuning);

    expect(applied.state.cashCents).toBe(1_200_000);
    expect(applied.cashChangeCents).toBe(-40_000);
    expect(state.cashCents).toBe(1_240_000);
  });

  it('adds revenue before burn, so a profitable company gains cash', () => {
    const applied = applyDailyEconomy(makeState({ mrrCents: 3_000_000 }), tuning);

    expect(applied.cashChangeCents).toBe(100_000 - 40_000);
    expect(applied.state.cashCents).toBe(1_240_000 + 60_000);
  });

  it('leaves every other field alone', () => {
    const state = makeState({ mrrCents: 1_015 });

    const applied = applyDailyEconomy(state, tuning).state;

    expect({ ...applied, cashCents: state.cashCents }).toEqual(state);
  });

  it('goes below zero after the 32nd Garage day; death and overdraft are later stories', () => {
    let state = makeState();
    for (let day = 0; day < 32; day += 1) state = applyDailyEconomy(state, tuning).state;

    expect(state.cashCents).toBe(-40_000);
  });

  it('keeps cash a safe integer whatever the MRR and GPU units (DET-06)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 10_000_000_000 }),
        fc.integer({ min: 0, max: 1_000 }),
        fc.integer({ min: 1, max: 100 }),
        (mrrCents, gpuCapacityUnits, days) => {
          let state = makeState({ mrrCents, gpuCapacityUnits });
          for (let day = 0; day < days; day += 1) state = applyDailyEconomy(state, tuning).state;

          expect(Number.isSafeInteger(state.cashCents)).toBe(true);
          expect(state.cashCents).toBe(
            1_240_000 +
              days *
                (divideRounded(mrrCents, billingMonthDays) - computeDailyBurnCents(state, tuning)),
          );
        },
      ),
    );
  });
});
