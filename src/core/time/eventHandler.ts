import type { EconomyState, EconomyTuning } from '../economy';
import type { AdvanceMode } from './advanceMode';
import type { DomainEvent } from './domainEvent';
import type { QueuedEvent } from './queuedEvent';
import type { TimeState } from './timeState';

// Tuning is passed in, never imported (D6); one object keeps advance at three parameters.
export interface AdvanceContext {
  readonly mode: AdvanceMode;
  readonly tuning: EconomyTuning;
}

// Every slice a handler may read or write; core/run's GameState satisfies it.
export type SimulationState = TimeState & EconomyState;

export interface HandlerResult<S extends TimeState> {
  readonly state: S;
  readonly events: readonly DomainEvent[];
}

export type EventHandler = <S extends SimulationState>(
  state: S,
  event: QueuedEvent,
  context: AdvanceContext,
) => HandlerResult<S>;
