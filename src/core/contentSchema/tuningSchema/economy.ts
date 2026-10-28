import { defineFieldGroup, wholeAtLeast } from '../fieldGroup';

export const economyTuning = defineFieldGroup({
  // Whole days: the daily step divides MRR by this count (Story 1.5 C-6).
  billingMonth: wholeAtLeast('days', 1),
  overdraftInterestPerDay: 'percent',
  belowZeroLimit: 'days',
  garageOverdraftFloor: 'usd',
  overdraftFloorOfLastRound: 'percent',
  headcountBurn: 'exponent',
});
