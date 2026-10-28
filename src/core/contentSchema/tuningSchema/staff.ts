import * as z from 'zod';

import { defineFieldGroup, range } from '../fieldGroup';

export const staffTuning = defineFieldGroup({
  messageInterval: 'gameSeconds',
  contentMinMorale: 'count',
  strainedMinMorale: 'count',
  leavingResignAfter: 'days',
  overloadedAboveQueuedMessages: 'count',
  overloadedMoraleDriftPerDay: 'count',
  normalMoraleDriftPerDay: 'count',
  eventMoraleSwing: range('count'),
  exFaangSalary: 'multiplier',
  safetyResearcherSalary: 'multiplier',
});

// Draft effects of traits 5–12 (GDD Initial tuning table); traits 1–4 are not tuning-tagged.
export const traitsTuning = z.strictObject({
  peterPan: defineFieldGroup({ throughput: 'multiplier' }),
  notionArchitect: defineFieldGroup({ throughput: 'multiplier', teammateMorale: 'count' }),
  rewriteItInRust: defineFieldGroup({ blockedTaskShare: 'percent', blockedFor: 'days' }),
  thumbsUp: defineFieldGroup({ defaultAnswerShare: 'percent' }),
  vibeCoder: defineFieldGroup({
    throughput: 'multiplier',
    incidentTaskShare: 'percent',
    incidentHype: 'hypeIndex',
  }),
  exFounder: defineFieldGroup({
    moraleSwing: 'count',
    moraleSwingInterval: 'days',
    leaveChancePerDay: 'percent',
    leaveEligibleAfter: 'days',
  }),
  meetingMaximalist: defineFieldGroup({ teamThroughputChange: 'percent' }),
  promptWhisperer: defineFieldGroup({ metisLoadChange: 'percent' }),
  aiMaximalist: defineFieldGroup({ policyProposalInterval: 'days' }),
});
