import { GAME_DAY_MS } from '../constants';
import { applyDailyEconomy } from '../economy';
import type { AdvanceContext, HandlerResult, SimulationState } from './eventHandler';
import type { QueuedEvent } from './queuedEvent';
import { scheduleEvent } from './scheduleEvent';

// The step at k × GAME_DAY_MS settles day k, the day that just ended, then books the next.
export function handleEconomyStep<S extends SimulationState>(
  state: S,
  event: QueuedEvent,
  context: AdvanceContext,
): HandlerResult<S> {
  const applied = applyDailyEconomy(state, context.tuning);
  return {
    state: scheduleEvent(applied.state, {
      gameMs: event.gameMs + GAME_DAY_MS,
      kind: 'economyStep',
    }),
    events: [
      {
        type: 'dailyEconomyApplied',
        atGameMs: event.gameMs,
        cashChangeCents: applied.cashChangeCents,
      },
    ],
  };
}
