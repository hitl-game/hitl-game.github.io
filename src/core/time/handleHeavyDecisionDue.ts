import type { HandlerResult } from './eventHandler';
import type { QueuedEvent } from './queuedEvent';
import type { TimeState } from './timeState';

export function handleHeavyDecisionDue<S extends TimeState>(
  state: S,
  event: QueuedEvent,
): HandlerResult<S> {
  return { state, events: [{ type: 'heavyDecisionOpened', atGameMs: event.gameMs }] };
}
