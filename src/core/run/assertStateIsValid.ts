import { assertInvariant } from '../../shared';
import { compareQueuedEvents, type QueuedEvent } from '../time';
import { canonicalize } from './canonicalize';
import type { GameState } from './gameState';

function assertQueueIsValid(queue: readonly QueuedEvent[], nowGameMs: number): void {
  queue.forEach((event, index) => {
    assertInvariant(event.gameMs >= nowGameMs, 'queued events are never before nowGameMs');
    const previous = queue[index - 1];
    if (previous !== undefined) {
      assertInvariant(
        compareQueuedEvents(previous, event) < 0,
        'the queue is sorted by (gameMs, kind priority, id)',
      );
    }
  });
  assertInvariant(
    new Set(queue.map((event) => event.id)).size === queue.length,
    'event ids are unique',
  );
}

// Full walk: only at run start, after a replay and in tests. advance and applyCommand keep
// to cheap local checks (project-context hot-path rule).
export function assertStateIsValid(state: GameState): void {
  // canonicalize is the one walker: it rejects classes, Map, Set, undefined, floats and cycles.
  canonicalize(state);
  assertInvariant(state.nowGameMs >= 0, 'nowGameMs is never negative');
  assertInvariant(state.counters.event >= 0, 'counters never go negative');
  assertQueueIsValid(state.queue, state.nowGameMs);
}
