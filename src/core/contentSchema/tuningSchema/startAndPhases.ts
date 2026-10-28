import * as z from 'zod';

import { atLeast, defineFieldGroup, range } from '../fieldGroup';

export const startTuning = defineFieldGroup({
  cash: atLeast('usd', 0),
  // The run state keeps these at or above zero, so a negative start fails the build, not newRun.
  hype: atLeast('hypeIndex', 0),
  alignment: atLeast('alignmentPoints', 0),
  gpuCapacityUnits: atLeast('count', 0),
});

// Per-phase numbers, so a reader writes `tuning.phases[phase].baseCostsPerDayCents`.
const phaseTuning = defineFieldGroup({
  baseCostsPerDay: atLeast('usd', 0),
  salaryPerHirePerDay: 'usd',
  gpuUnitCostPerDay: atLeast('usd', 0),
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
