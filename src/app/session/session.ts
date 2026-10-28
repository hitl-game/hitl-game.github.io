import type { ReadonlySignal } from '@preact/signals';

import type { Command, CommandError, EconomyTuning, GameState, PauseReason } from '../../core';
import type { ClockSources, VisibilitySource } from '../../platform';
import type { Result } from '../../shared';

export interface SessionOptions {
  readonly state: GameState;
  readonly tuning: EconomyTuning;
  // False for a run restored after its Deploy (Story 1.9).
  readonly isAwaitingDeploy?: boolean;
  readonly clockSources?: ClockSources;
  readonly visibility?: VisibilitySource;
}

export interface Session {
  readonly state: ReadonlySignal<GameState>;
  readonly pauseReasons: ReadonlySignal<ReadonlySet<PauseReason>>;
  readonly isAwaitingDeploy: ReadonlySignal<boolean>;
  readonly isClockRunning: ReadonlySignal<boolean>;
  readonly dispatch: (command: Command) => Result<void, CommandError>;
  readonly pause: (reason: PauseReason) => void;
  readonly resume: (reason: PauseReason) => void;
  // Seam until Story 1.8 replaces it with the logged deploy command.
  readonly markDeployed: () => void;
  readonly dispose: () => void;
}
