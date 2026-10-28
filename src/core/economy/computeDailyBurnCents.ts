import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

// Base costs plus compute; salaries, overdraft interest and churn arrive with their own
// stories (FR4 is shipped in pieces).
export function computeDailyBurnCents(state: EconomyState, tuning: EconomyTuning): number {
  const phase = tuning.phases[state.phase];
  return phase.baseCostsPerDayCents + state.gpuCapacityUnits * phase.gpuUnitCostPerDayCents;
}
