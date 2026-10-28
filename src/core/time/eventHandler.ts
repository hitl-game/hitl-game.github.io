import type { AdvanceMode } from './advanceMode';
import type { DomainEvent } from './domainEvent';
import type { QueuedEvent } from './queuedEvent';
import type { TimeState } from './timeState';

export interface HandlerContext {
  readonly mode: AdvanceMode;
}

export interface HandlerResult<S extends TimeState> {
  readonly state: S;
  readonly events: readonly DomainEvent[];
}

export type EventHandler = <S extends TimeState>(
  state: S,
  event: QueuedEvent,
  context: HandlerContext,
) => HandlerResult<S>;
