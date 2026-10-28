import * as z from 'zod';

import { defineFieldGroup, range } from '../fieldGroup';

const valuationAnchor = defineFieldGroup({ hype: 'hypeIndex', valuation: 'multiplier' });

export const hypeTuning = z.strictObject({
  changes: defineFieldGroup({
    launchHype: range('hypeIndex'),
    boldPostHype: 'hypeIndex',
    viralHype: 'hypeIndex',
    flopHype: 'hypeIndex',
    scandalHype: 'hypeIndex',
    decayPerDay: 'percent',
  }),
  // Linear between the anchors, clamped to them (GDD Daily simulation).
  valuationMultiple: z.strictObject({ low: valuationAnchor, high: valuationAnchor }),
});

export const customersTuning = defineFieldGroup({
  baseNewCustomersPerDay: 'count',
  newCustomersPerDayPerHypePoint: 'milli',
  teamSharePerHypePoint: 'percent',
  teamShareMax: 'percent',
  baselineChurnPerDay: 'percent',
  selfServePricePerMonth: 'usd',
  teamPricePerMonth: 'usd',
  enterprisePricePerMonth: range('usd'),
});
