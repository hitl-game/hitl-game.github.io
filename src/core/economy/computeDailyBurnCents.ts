import { assertInvariant } from '../../shared';
import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

// Base costs plus compute; salaries, overdraft interest and churn arrive with their own
// stories (FR4 is shipped in pieces).
export function computeDailyBurnCents(state: EconomyState, tuning: EconomyTuning): number {
  const phase = tuning.phases[state.phase];
  const burnCents =
    phase.baseCostsPerDayCents + state.gpuCapacityUnits * phase.gpuUnitCostPerDayCents;
  // The schema bounds each term but not their product; an inexact burn would reach the
  // runway as a plausible wrong number rather than fail.
  assertInvariant(Number.isSafeInteger(burnCents), 'the daily burn is a safe integer');
  return burnCents;
}
