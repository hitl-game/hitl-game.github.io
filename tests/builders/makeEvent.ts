import { formatEventId, type QueuedEvent } from '../../src/core';

export function makeEvent(overrides: Partial<QueuedEvent> = {}): QueuedEvent {
  return { id: formatEventId(1), gameMs: 0, kind: 'dayBoundary', ...overrides };
}
