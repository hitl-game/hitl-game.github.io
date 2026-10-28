import { assertInvariant } from '../../shared';
import { withoutNegativeZero } from '../numerics';
import type { AdvanceMode } from './advanceMode';
import type { DomainEvent } from './domainEvent';
import type { HandlerContext, HandlerResult } from './eventHandler';
import { eventHandlers } from './eventHandlers';
import { eventKinds, type EventKind } from './eventKinds';
import type { EventId, QueuedEvent } from './queuedEvent';
import type { TimeState } from './timeState';

export interface StoppedBy {
  readonly kind: EventKind;
  readonly eventId: EventId;
  readonly atGameMs: number;
}

export interface AdvanceResult<S extends TimeState> {
  readonly state: S;
  readonly events: readonly DomainEvent[];
  readonly stoppedBy: StoppedBy | null;
}

function processNextEvent<S extends TimeState>(
  state: S,
  head: QueuedEvent,
  context: HandlerContext,
): HandlerResult<S> {
  assertInvariant(
    head.gameMs >= state.nowGameMs,
    'the queue never holds an event before nowGameMs',
  );
  const popped: S = { ...state, nowGameMs: head.gameMs, queue: state.queue.slice(1) };
  return eventHandlers[head.kind](popped, head, context);
}

export function advance<S extends TimeState>(
  state: S,
  untilGameMs: number,
  mode: AdvanceMode,
): AdvanceResult<S> {
  assertInvariant(
    Number.isSafeInteger(untilGameMs) && untilGameMs >= state.nowGameMs,
    'advance never moves time backwards',
  );
  let current = state;
  const events: DomainEvent[] = [];
  for (let head = current.queue[0]; head !== undefined && head.gameMs <= untilGameMs;) {
    const step = processNextEvent(current, head, { mode });
    current = step.state;
    events.push(...step.events);
    if (eventKinds[head.kind].blocking) {
      const stoppedBy: StoppedBy = { kind: head.kind, eventId: head.id, atGameMs: head.gameMs };
      return { state: current, events, stoppedBy };
    }
    head = current.queue[0];
  }
  return {
    state: { ...current, nowGameMs: withoutNegativeZero(untilGameMs) },
    events,
    stoppedBy: null,
  };
}
