import { assertInvariant } from '../../shared';
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
  const cashCents = state.cashCents + cashChangeCents;
  // The full state walk runs only at start and after replay; an unsafe sum caught here fails
  // at its cause instead of at the next fingerprint.
  assertInvariant(
    Number.isSafeInteger(cashChangeCents) && Number.isSafeInteger(cashCents),
    'the daily cash change and the new cash balance are safe integers',
  );
  return { state: { ...state, cashCents }, cashChangeCents };
}
