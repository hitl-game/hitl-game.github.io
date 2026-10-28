import type { RngStreams } from '../rng';
import type { QueuedEvent } from '../time';
import type { InputLogEntry } from './inputLogEntry';
import type { RunStart } from './runStart';

// Next sequence number per ID prefix; IDs never come from random values.
export interface Counters {
  readonly event: number;
}

export interface GameState extends RunStart {
  readonly nowGameMs: number;
  readonly queue: readonly QueuedEvent[];
  readonly rngStreams: RngStreams;
  readonly counters: Counters;
  readonly inputLog: readonly InputLogEntry[];
}
