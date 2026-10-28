import { describe, expect, it } from 'vitest';

import { makeEconomyTuning } from '../../../tests/builders';
import { createStartingEconomy } from './createStartingEconomy';

describe('createStartingEconomy', () => {
  it('starts in the Garage with the tuned cash and GPU units and no revenue (ECO-01)', () => {
    expect(createStartingEconomy(makeEconomyTuning())).toEqual({
      phase: 'garage',
      cashCents: 1_240_000,
      mrrCents: 0,
      gpuCapacityUnits: 1,
    });
  });

  it('follows the tuning it is given', () => {
    const economy = createStartingEconomy(
      makeEconomyTuning({ 'start.cashUsd': 99.5, 'start.gpuCapacityUnits': 2 }),
    );

    expect(economy.cashCents).toBe(9_950);
    expect(economy.gpuCapacityUnits).toBe(2);
  });
});
