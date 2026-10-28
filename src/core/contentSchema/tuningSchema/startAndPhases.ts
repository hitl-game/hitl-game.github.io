import * as z from 'zod';

import { defineFieldGroup, range } from '../fieldGroup';

export const startTuning = defineFieldGroup({
  cash: 'usd',
  hype: 'hypeIndex',
  alignment: 'alignmentPoints',
  gpuCapacityUnits: 'count',
});

// Per-phase numbers, so a reader writes `tuning.phases[phase].baseCostsPerDayCents`.
const phaseTuning = defineFieldGroup({
  baseCostsPerDay: 'usd',
  salaryPerHirePerDay: 'usd',
  gpuUnitCostPerDay: 'usd',
  newCustomersPhase: 'multiplier',
  alignmentDriftPhase: 'multiplier',
  messageArrivalInterval: range('gameSeconds'),
  eventInterval: range('activeMinutes'),
});

export const phasesTuning = z.strictObject({
  garage: phaseTuning,
  seed: phaseTuning,
  seriesA: phaseTuning,
});
