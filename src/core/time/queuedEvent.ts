import type { Brand } from '../../shared';
import type { EventKind } from './eventKinds';

export type EventId = Brand<string, 'EventId'>;

export interface QueuedEvent {
  readonly id: EventId;
  readonly gameMs: number;
  readonly kind: EventKind;
}
