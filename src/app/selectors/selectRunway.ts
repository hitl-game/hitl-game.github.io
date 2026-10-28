import { computeRunwayDays, type EconomyState, type EconomyTuning, type Runway } from '../../core';

// A plain function until app/session exists (Story 1.6); 1.8 wraps it in `computed`. It
// reads the economy slice only, so hidden state (Alignment, Hype) can never leak through it.
export const selectRunway = (state: EconomyState, tuning: EconomyTuning): Runway =>
  computeRunwayDays(state, tuning);
