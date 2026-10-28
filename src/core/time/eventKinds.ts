// Ties at the same gameMs run in ascending priority; a blocking kind stops advance right
// after it is processed. Later stories extend this table (and only this table).
// economyStep sits between the two: at k × GAME_DAY_MS the next day starts, then the day that
// just ended settles, so a heavy decision due then never opens before that cash is applied.
export const eventKinds = {
  dayBoundary: { priority: 10, blocking: false },
  economyStep: { priority: 15, blocking: false },
  heavyDecisionDue: { priority: 20, blocking: true },
} as const;

export type EventKind = keyof typeof eventKinds;
