import type { EventHandler } from './eventHandler';
import type { EventKind } from './eventKinds';
import { handleDayBoundary } from './handleDayBoundary';
import { handleHeavyDecisionDue } from './handleHeavyDecisionDue';

// Record<EventKind, …>: a new kind without a handler does not compile.
export const eventHandlers: Readonly<Record<EventKind, EventHandler>> = {
  dayBoundary: handleDayBoundary,
  heavyDecisionDue: handleHeavyDecisionDue,
};
