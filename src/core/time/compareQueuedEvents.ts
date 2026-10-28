import { SORT_AFTER, SORT_BEFORE } from '../constants';
import { eventKinds } from './eventKinds';
import type { EventId, QueuedEvent } from './queuedEvent';

// Code-unit comparison, never localeCompare: IDs are zero-padded, so this order is creation
// order on every engine and locale (DET-08).
function compareEventIds(a: EventId, b: EventId): number {
  if (a === b) return 0;
  return a < b ? SORT_BEFORE : SORT_AFTER;
}

export function compareQueuedEvents(a: QueuedEvent, b: QueuedEvent): number {
  if (a.gameMs !== b.gameMs) return a.gameMs - b.gameMs;
  const priorityDelta = eventKinds[a.kind].priority - eventKinds[b.kind].priority;
  if (priorityDelta !== 0) return priorityDelta;
  return compareEventIds(a.id, b.id);
}
