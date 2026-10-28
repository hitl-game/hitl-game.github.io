import { assertInvariant } from '../../shared';
import { ID_SEQUENCE_WIDTH, rngStreamNames } from '../constants';
import { isRngStreamState, type RngStreams } from '../rng';
import { compareQueuedEvents, eventKinds, formatEventId, type QueuedEvent } from '../time';
import { canonicalize } from './canonicalize';
import type { GameState } from './gameState';
import { toRunSeed } from './runSeed';
import { gameSpeeds, timings, type Settings } from './settings';

// The counter must be ahead of every queued id, or the next scheduleEvent mints a duplicate.
function assertEventIsWellFormed(event: QueuedEvent, eventCounter: number): void {
  assertInvariant(Object.hasOwn(eventKinds, event.kind), `unknown event kind ${event.kind}`);
  const sequence = Number(event.id.slice(-ID_SEQUENCE_WIDTH));
  assertInvariant(
    Number.isSafeInteger(sequence) &&
      sequence > 0 &&
      sequence <= eventCounter &&
      formatEventId(sequence) === event.id,
    `event id ${event.id} is well formed and already counted`,
  );
}

function assertQueueIsValid(state: GameState): void {
  const { queue, nowGameMs } = state;
  queue.forEach((event, index) => {
    assertInvariant(event.gameMs >= nowGameMs, 'queued events are never before nowGameMs');
    const previous = queue[index - 1];
    if (previous !== undefined) {
      assertInvariant(
        compareQueuedEvents(previous, event) < 0,
        'the queue is sorted by (gameMs, kind priority, id)',
      );
    }
    assertEventIsWellFormed(event, state.counters.event);
  });
  assertInvariant(
    new Set(queue.map((event) => event.id)).size === queue.length,
    'event ids are unique',
  );
}

function assertStartIsValid(settings: Settings, rngStreams: RngStreams): void {
  assertInvariant(gameSpeeds.includes(settings.gameSpeed), 'gameSpeed is a known value');
  assertInvariant(timings.includes(settings.timing), 'timing is a known value');
  assertInvariant(
    rngStreamNames.every(
      (name) => Object.hasOwn(rngStreams, name) && isRngStreamState(rngStreams[name]),
    ),
    'every released stream is four int32 words, not all zero',
  );
}

// Full walk: only at run start, after a replay and in tests. advance and applyCommand keep
// to cheap local checks (project-context hot-path rule).
export function assertStateIsValid(state: GameState): void {
  // canonicalize is the one walker: it rejects classes, Map, Set, undefined, floats and cycles.
  canonicalize(state);
  toRunSeed(state.seed);
  assertStartIsValid(state.settings, state.rngStreams);
  assertInvariant(state.nowGameMs >= 0, 'nowGameMs is never negative');
  assertInvariant(state.counters.event >= 0, 'counters never go negative');
  assertQueueIsValid(state);
}
