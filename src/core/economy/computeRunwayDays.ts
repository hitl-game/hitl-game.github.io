import { computeDailyBurnCents } from './computeDailyBurnCents';
import type { EconomyState } from './economyState';
import type { EconomyTuning } from './economyTuning';

// `noBurn` rather than Infinity: a runway is shown to the player, and Infinity is neither a
// safe integer nor a number the formatters accept.
export type Runway = { readonly kind: 'days'; readonly days: number } | { readonly kind: 'noBurn' };

export function computeRunwayDays(state: EconomyState, tuning: EconomyTuning): Runway {
  const dailyBurnCents = computeDailyBurnCents(state, tuning);
  if (dailyBurnCents <= 0) return { kind: 'noBurn' };
  // Clamped at zero: an overdraft is not negative days (Story 5.9 owns the red runway).
  if (state.cashCents < 0) return { kind: 'days', days: 0 };
  // An integer floor; `%` keeps the dividend's sign, so this is only right for cash >= 0.
  const days = (state.cashCents - (state.cashCents % dailyBurnCents)) / dailyBurnCents;
  return { kind: 'days', days };
}
