import { defineFieldGroup } from '../fieldGroup';

export const economyTuning = defineFieldGroup({
  billingMonth: 'days',
  overdraftInterestPerDay: 'percent',
  belowZeroLimit: 'days',
  garageOverdraftFloor: 'usd',
  overdraftFloorOfLastRound: 'percent',
  headcountBurn: 'exponent',
});
