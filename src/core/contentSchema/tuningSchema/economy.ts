import { defineFieldGroup, wholeAtLeast } from '../fieldGroup';

export const economyTuning = defineFieldGroup({
  // Whole days: the daily step divides MRR by this count.
  billingMonth: wholeAtLeast('days', 1),
  overdraftInterestPerDay: 'percent',
  belowZeroLimit: 'days',
  garageOverdraftFloor: 'usd',
  overdraftFloorOfLastRound: 'percent',
  headcountBurn: 'exponent',
});
