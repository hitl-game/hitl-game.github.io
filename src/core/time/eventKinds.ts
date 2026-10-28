// Ties at the same gameMs run in ascending priority; a blocking kind stops advance right
// after it is processed. Later stories extend this table (and only this table).
// economyStep sits between the two: a day starts before its cash settles, and a heavy
// decision never opens before that day's cash is applied.
export const eventKinds = {
  dayBoundary: { priority: 10, blocking: false },
  economyStep: { priority: 15, blocking: false },
  heavyDecisionDue: { priority: 20, blocking: true },
} as const;

export type EventKind = keyof typeof eventKinds;
