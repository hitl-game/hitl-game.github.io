import { defineFieldGroup, range } from '../fieldGroup';

// Arrival intervals and event cadence are per phase (phases group).
export const messagesTuning = defineFieldGroup({
  backlogCapMessages: range('count'),
  backlogTopItemWindow: range('realSeconds'),
  noRepeatWindowMaxMessages: 'count',
  noRepeatPoolMarginMessages: 'count',
  tradeOffCap: 'percent',
  tradeOffCashFloor: 'usd',
  heavyTradeOffCap: 'percent',
  routineInferenceLineInterval: 'gameSeconds',
  seriesARoundExtraArrivalsPerMinute: 'count',
  maxArrivalsPerMinute: 'count',
});

export const pacingTuning = defineFieldGroup({
  tickerHeadlineInterval: 'days',
});
