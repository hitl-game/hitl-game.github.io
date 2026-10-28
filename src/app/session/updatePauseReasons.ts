import type { Signal } from '@preact/signals';

import type { PauseReason } from '../../core';

// A set, not a counter: the same surface cannot stack a reason. A new set on every change so
// subscribers see a new reference; no write when nothing changes.
export function updatePauseReasons(
  pauseReasons: Signal<ReadonlySet<PauseReason>>,
  reason: PauseReason,
  isActive: boolean,
): void {
  const current = pauseReasons.peek();
  if (current.has(reason) === isActive) return;
  const next = new Set(current);
  if (isActive) next.add(reason);
  else next.delete(reason);
  pauseReasons.value = next;
}
