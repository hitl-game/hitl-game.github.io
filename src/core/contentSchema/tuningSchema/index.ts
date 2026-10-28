import * as z from 'zod';

import { alignmentTuning } from './alignment';
import { computeTuning } from './compute';
import { economyTuning } from './economy';
import { customersTuning, hypeTuning } from './hypeAndCustomers';
import { heavyDecisionsTuning, investorsTuning, roundsTuning } from './investorsAndRounds';
import { messagesTuning, pacingTuning } from './messagesAndPacing';
import { clueReplayTuning, metaTuning, spineTuning } from './spineAndMeta';
import { traitsTuning, staffTuning } from './staff';
import { phasesTuning, startTuning } from './startAndPhases';

// Group order follows the GDD Initial tuning table, then the inline [tuning] tags.
export const tuningSchema = z.strictObject({
  start: startTuning,
  phases: phasesTuning,
  economy: economyTuning,
  compute: computeTuning,
  hype: hypeTuning,
  customers: customersTuning,
  staff: staffTuning,
  traits: traitsTuning,
  investors: investorsTuning,
  rounds: roundsTuning,
  heavyDecisions: heavyDecisionsTuning,
  messages: messagesTuning,
  pacing: pacingTuning,
  alignment: alignmentTuning,
  spine: spineTuning,
  meta: metaTuning,
  clueReplay: clueReplayTuning,
});

export type CompiledTuning = z.output<typeof tuningSchema>;
