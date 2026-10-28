import { batch } from '@preact/signals';

import { applyCommand, type Command, type CommandError } from '../../core';
import { ok, type Result } from '../../shared';
import type { PresentLoop } from './createPresentLoop';
import type { SessionSignals } from './createSessionSignals';

export function createDispatch(
  signals: SessionSignals,
  loop: PresentLoop,
): (command: Command) => Result<void, CommandError> {
  const { state, isBlockedByStop } = signals;
  // Replay contract (D3): advance to now before every command, except after a blocking stop,
  // where even a zero-length advance could open a second stop that replay leaves queued.
  return (command) => {
    if (!isBlockedByStop.peek()) loop.advanceTo(loop.readTargetGameMs());
    const current = state.peek();
    const applied = applyCommand(current, command, current.nowGameMs);
    if (!applied.ok) return applied;
    batch(() => {
      state.value = applied.value.state;
      isBlockedByStop.value = false;
    });
    return ok(undefined);
  };
}
