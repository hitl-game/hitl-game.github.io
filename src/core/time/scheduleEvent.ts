import { assertInvariant } from '../../shared';
import { compareQueuedEvents } from './compareQueuedEvents';
import type { EventKind } from './eventKinds';
import { formatEventId } from './formatEventId';
import type { QueuedEvent } from './queuedEvent';
import type { TimeState } from './timeState';

export interface PendingEvent {
  readonly gameMs: number;
  readonly kind: EventKind;
}

export function scheduleEvent<S extends TimeState>(state: S, pending: PendingEvent): S {
  assertInvariant(
    Number.isSafeInteger(pending.gameMs) && pending.gameMs >= state.nowGameMs,
    'events are scheduled at or after nowGameMs',
  );
  const sequence = state.counters.event + 1;
  const event: QueuedEvent = {
    id: formatEventId(sequence),
    gameMs: pending.gameMs,
    kind: pending.kind,
  };
  const index = state.queue.findLastIndex((queued) => compareQueuedEvents(queued, event) < 0) + 1;
  return {
    ...state,
    queue: [...state.queue.slice(0, index), event, ...state.queue.slice(index)],
    counters: { ...state.counters, event: sequence },
  };
}
