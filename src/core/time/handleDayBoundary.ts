import { GAME_DAY_MS } from '../constants';
import type { HandlerResult } from './eventHandler';
import type { QueuedEvent } from './queuedEvent';
import { scheduleEvent } from './scheduleEvent';
import type { TimeState } from './timeState';

export function handleDayBoundary<S extends TimeState>(
  state: S,
  event: QueuedEvent,
): HandlerResult<S> {
  return {
    state: scheduleEvent(state, { gameMs: event.gameMs + GAME_DAY_MS, kind: 'dayBoundary' }),
    events: [{ type: 'gameDayStarted', atGameMs: event.gameMs }],
  };
}
