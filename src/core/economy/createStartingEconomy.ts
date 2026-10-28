import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

// Every run starts in the Garage with no revenue: run-start facts, not tuning.
export function createStartingEconomy(tuning: EconomyTuning): EconomyState {
  return {
    phase: 'garage',
    cashCents: tuning.start.cashCents,
    mrrCents: 0,
    gpuCapacityUnits: tuning.start.gpuCapacityUnits,
  };
}
