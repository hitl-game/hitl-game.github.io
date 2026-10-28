import * as z from 'zod';

import { defineFieldGroup, range } from '../fieldGroup';

export const investorsTuning = z.strictObject({
  cashOfRoundTop: defineFieldGroup({
    growthFund: 'multiplier',
    ethicalVentureCapital: 'multiplier',
    billionaire: 'multiplier',
  }),
  growthFundClause: defineFieldGroup({
    mrrGrowthTarget: 'percent',
    period: 'days',
    missHype: 'hypeIndex',
  }),
  responsibleVenturesClause: defineFieldGroup({
    grace: 'days',
    penaltyHype: 'hypeIndex',
    penaltyInterval: 'days',
  }),
});

const fundingRound = defineFieldGroup({
  triggerMrr: 'usd',
  raise: range('usd'),
  postMoney: range('usd'),
});

export const roundsTuning = z.strictObject({
  seed: fundingRound,
  seriesA: fundingRound,
  // Series A+ growth target state machine; later rounds use the same ARR multiple.
  growthTarget: defineFieldGroup({
    annualRecurringRevenue: 'multiplier',
    window: 'days',
    downRoundAfterMisses: 'count',
    downRoundCashCut: 'percent',
    downRoundHype: 'hypeIndex',
  }),
});

export const heavyDecisionsTuning = defineFieldGroup({
  riskyReleaseSuccess: 'percent',
  crisisFixSuccess: 'percent',
  capabilityGrantSuccess: 'percent',
  minGap: 'days',
  failureDownside: 'multiplier',
});
