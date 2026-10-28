import * as z from 'zod';

import { atLeast, defineFieldGroup, range } from '../fieldGroup';

export const startTuning = defineFieldGroup({
  cash: atLeast('usd', 0),
  hype: 'hypeIndex',
  alignment: 'alignmentPoints',
  gpuCapacityUnits: 'count',
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
