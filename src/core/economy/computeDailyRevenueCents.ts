import { assertInvariant } from '../../shared';
import { GAME_DAY_MS } from '../constants';
import { divideRounded } from '../numerics';
import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

// Dividing MRR by the day count, not multiplying it by game-ms, keeps every intermediate a
// safe integer; the one rounding is half away from zero (D2).
export function computeDailyRevenueCents(state: EconomyState, tuning: EconomyTuning): number {
  const { billingMonthGameMs } = tuning.economy;
  assertInvariant(
    billingMonthGameMs > 0 && billingMonthGameMs % GAME_DAY_MS === 0,
    'the billing month is a positive whole number of game days',
  );
  return divideRounded(state.mrrCents, divideRounded(billingMonthGameMs, GAME_DAY_MS));
}
