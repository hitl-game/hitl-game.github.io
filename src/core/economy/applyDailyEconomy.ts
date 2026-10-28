import { computeDailyBurnCents } from './computeDailyBurnCents';
import { computeDailyRevenueCents } from './computeDailyRevenueCents';
import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

export interface DailyEconomyResult<S extends EconomyState> {
  readonly state: S;
  readonly cashChangeCents: number;
}

// One settlement per game day: cash may go below zero (overdraft rules are Story 5.8).
export function applyDailyEconomy<S extends EconomyState>(
  state: S,
  tuning: EconomyTuning,
): DailyEconomyResult<S> {
  const cashChangeCents =
    computeDailyRevenueCents(state, tuning) - computeDailyBurnCents(state, tuning);
  return { state: { ...state, cashCents: state.cashCents + cashChangeCents }, cashChangeCents };
}
