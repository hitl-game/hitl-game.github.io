import { defineFieldGroup } from '../fieldGroup';

export const spineTuning = defineFieldGroup({
  roundCooldown: 'days',
  minBeatGap: 'days',
});

export const metaTuning = defineFieldGroup({
  aegisVersionOffset: 'count',
});

// Numbers of the clue-replay counterfactual (architecture N5); the formula lives in code.
export const clueReplayTuning = defineFieldGroup({
  staffMessage: 'gameSeconds',
  marginalHeadcount: 'exponent',
});
