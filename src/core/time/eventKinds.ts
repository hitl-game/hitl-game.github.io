// Ties at the same gameMs run in ascending priority; a blocking kind stops advance right
// after it is processed. Later stories extend this table (and only this table).
export const eventKinds = {
  dayBoundary: { priority: 10, blocking: false },
  heavyDecisionDue: { priority: 20, blocking: true },
} as const;

export type EventKind = keyof typeof eventKinds;
