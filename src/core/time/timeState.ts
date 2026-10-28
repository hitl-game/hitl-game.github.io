import type { QueuedEvent } from './queuedEvent';

// The slice of the run state that the event queue reads and writes. core/run owns the full
// GameState; keeping time generic over it avoids a run ↔ time import cycle.
export interface TimeState {
  readonly nowGameMs: number;
  readonly queue: readonly QueuedEvent[];
  readonly counters: { readonly event: number };
}
