import { computed, signal, type ReadonlySignal, type Signal } from '@preact/signals';

import { REAL_MS_PER_GAME_MS_BY_SPEED, type GameState, type PauseReason } from '../../core';

export interface SessionSignals {
  readonly state: Signal<GameState>;
  readonly pauseReasons: Signal<ReadonlySet<PauseReason>>;
  readonly isAwaitingDeploy: Signal<boolean>;
  readonly isVisible: Signal<boolean>;
  readonly isBlockedByStop: Signal<boolean>;
  readonly isClockRunning: ReadonlySignal<boolean>;
  readonly realMsPerGameMs: ReadonlySignal<number>;
}

interface InitialValues {
  readonly state: GameState;
  readonly isAwaitingDeploy: boolean;
  readonly isVisible: boolean;
}

export function createSessionSignals(initial: InitialValues): SessionSignals {
  const state = signal(initial.state);
  const pauseReasons = signal<ReadonlySet<PauseReason>>(new Set());
  const isAwaitingDeploy = signal(initial.isAwaitingDeploy);
  const isVisible = signal(initial.isVisible);
  const isBlockedByStop = signal(false);
  const isClockRunning = computed(
    () =>
      isVisible.value &&
      !isAwaitingDeploy.value &&
      pauseReasons.value.size === 0 &&
      !isBlockedByStop.value,
  );
  const realMsPerGameMs = computed(
    () => REAL_MS_PER_GAME_MS_BY_SPEED[state.value.settings.gameSpeed],
  );
  return {
    state,
    pauseReasons,
    isAwaitingDeploy,
    isVisible,
    isBlockedByStop,
    isClockRunning,
    realMsPerGameMs,
  };
}
