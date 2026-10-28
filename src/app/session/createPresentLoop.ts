import { batch, effect } from '@preact/signals';

import { advance, type DomainEvent, type EconomyTuning } from '../../core';
import { createGameClock, type ClockSources } from '../../platform';
import type { SessionSignals } from './createSessionSignals';

export interface PresentLoop {
  readonly advanceTo: (untilGameMs: number) => readonly DomainEvent[];
  readonly readTargetGameMs: () => number;
  readonly dispose: () => void;
}

// The one place live play advances. Events are returned for the reactors to come (C4).
function createAdvanceTo(signals: SessionSignals, tuning: EconomyTuning): PresentLoop['advanceTo'] {
  const { state, isBlockedByStop } = signals;
  return (untilGameMs) => {
    const result = advance(state.peek(), untilGameMs, { mode: 'present', tuning });
    batch(() => {
      state.value = result.state;
      if (result.stoppedBy !== null) isBlockedByStop.value = true;
    });
    return result.events;
  };
}

export function createPresentLoop(
  signals: SessionSignals,
  tuning: EconomyTuning,
  clockSources: ClockSources | undefined,
): PresentLoop {
  const { state, isClockRunning } = signals;
  const advanceTo = createAdvanceTo(signals, tuning);

  const readTargetGameMs = (): number => {
    const nowGameMs = state.peek().nowGameMs;
    return isClockRunning.peek() ? Math.max(nowGameMs, clock.readGameMs()) : nowGameMs;
  };

  const clock = createGameClock({
    onFrame: () => {
      const targetGameMs = readTargetGameMs();
      if (targetGameMs > state.peek().nowGameMs) advanceTo(targetGameMs);
    },
    sources: clockSources,
  });

  // Every change of the running flag or the speed re-anchors at nowGameMs: no catch-up jump.
  const stopSyncingClock = effect(() => {
    if (!isClockRunning.value) {
      clock.stop();
      return;
    }
    clock.start(state.peek().nowGameMs, signals.realMsPerGameMs.value);
  });

  return {
    advanceTo,
    readTargetGameMs,
    dispose: () => {
      stopSyncingClock();
      clock.stop();
    },
  };
}
