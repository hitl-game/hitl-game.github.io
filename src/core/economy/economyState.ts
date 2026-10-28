import type { Phase } from '../constants';

// The slice of the run state the daily economy reads and writes. core/run owns the full
// GameState; keeping the economy generic over it avoids a run ↔ economy import cycle.
export interface EconomyState {
  readonly phase: Phase;
  readonly cashCents: number;
  readonly mrrCents: number;
  readonly gpuCapacityUnits: number;
}
