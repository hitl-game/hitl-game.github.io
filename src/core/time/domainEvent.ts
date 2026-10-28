export type DomainEvent =
  | { readonly type: 'gameDayStarted'; readonly atGameMs: number }
  | { readonly type: 'heavyDecisionOpened'; readonly atGameMs: number };
