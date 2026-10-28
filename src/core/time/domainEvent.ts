// Past tense, and never a balance or hidden state: reactors drive the cash tile from the
// change alone.
export type DomainEvent =
  | { readonly type: 'gameDayStarted'; readonly atGameMs: number }
  | {
      readonly type: 'dailyEconomyApplied';
      readonly atGameMs: number;
      readonly cashChangeCents: number;
    }
  | { readonly type: 'heavyDecisionOpened'; readonly atGameMs: number };
