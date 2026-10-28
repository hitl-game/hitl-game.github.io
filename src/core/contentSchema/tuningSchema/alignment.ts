import * as z from 'zod';

import { defineFieldGroup, range } from '../fieldGroup';

export const alignmentTuning = z.strictObject({
  drift: defineFieldGroup({
    lowStakes: 'alignmentPoints',
    mediumStakes: 'alignmentPoints',
    highStakes: 'alignmentPoints',
    capabilityGrant: range('alignmentPoints'),
  }),
  auditPause: defineFieldGroup({
    policiesOff: 'days',
    penaltyHype: 'hypeIndex',
    recovery: 'alignmentPoints',
    cooldown: 'days',
  }),
  researcherTrend: defineFieldGroup({
    window: 'days',
    risingAt: 'alignmentPoints',
    fallingAt: 'alignmentPoints',
  }),
});
