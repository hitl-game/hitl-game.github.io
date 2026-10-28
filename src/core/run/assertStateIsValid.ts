import { assertInvariant } from '../../shared';
import { ID_SEQUENCE_WIDTH, rngStreamNames } from '../constants';
import { isRngStreamState, type RngStreams } from '../rng';
import { compareQueuedEvents, eventKinds, formatEventId, type QueuedEvent } from '../time';
import { canonicalize } from './canonicalize';
import type { GameState } from './gameState';
import type { InputLogEntry } from './inputLogEntry';
import { toRunSeed } from './runSeed';
import { gameSpeeds, timings, type Settings } from './settings';

const gameStateKeys = [
  'seed',
  'loopNumber',
  'contentPackVersion',
  'settings',
  'nowGameMs',
  'queue',
  'rngStreams',
  'counters',
  'inputLog',
] as const satisfies readonly (keyof GameState)[];
const settingsKeys = ['gameSpeed', 'timing'] as const satisfies readonly (keyof Settings)[];
const queuedEventKeys = ['id', 'gameMs', 'kind'] as const satisfies readonly (keyof QueuedEvent)[];
const inputLogEntryKeys = [
  'atGameMs',
  'command',
] as const satisfies readonly (keyof InputLogEntry)[];

// A stray key changes the fingerprint without changing the run, so every record is exact.
function assertHasExactKeys(value: object, keys: readonly string[], message: string): void {
  assertInvariant(
    Object.keys(value).length === keys.length && keys.every((key) => Object.hasOwn(value, key)),
    message,
  );
}

// canonicalize lets null, booleans and strings through, and `>=` coerces them, so time and
// counter fields are type-checked before any comparison.
const isGameMs = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

// The counter must be ahead of every queued id, or the next scheduleEvent mints a duplicate.
function assertEventIsWellFormed(event: QueuedEvent, eventCounter: number): void {
  assertHasExactKeys(event, queuedEventKeys, 'a queued event holds id, gameMs and kind only');
  assertInvariant(
    typeof event.kind === 'string' && Object.hasOwn(eventKinds, event.kind),
    `unknown event kind ${event.kind}`,
  );
  assertInvariant(typeof event.id === 'string', 'an event id is a string');
  assertInvariant(isGameMs(event.gameMs), 'an event gameMs is a non-negative integer');
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
    // Kind and id first: the comparator below reads both.
    assertEventIsWellFormed(event, state.counters.event);
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

function assertStartIsValid(settings: Settings, rngStreams: RngStreams): void {
  assertHasExactKeys(settings, settingsKeys, 'settings holds gameSpeed and timing only');
  assertInvariant(gameSpeeds.includes(settings.gameSpeed), 'gameSpeed is a known value');
  assertInvariant(timings.includes(settings.timing), 'timing is a known value');
  assertInvariant(
    rngStreamNames.every(
      (name) => Object.hasOwn(rngStreams, name) && isRngStreamState(rngStreams[name]),
    ),
    'every released stream is four int32 words, not all zero',
  );
  assertHasExactKeys(rngStreams, rngStreamNames, 'rngStreams holds the released streams only');
}

// Replay advances to each entry in turn (C-4), so log times never decrease and never pass now.
function assertInputLogIsValid(state: GameState): void {
  state.inputLog.reduce((previousGameMs, entry) => {
    assertHasExactKeys(
      entry,
      inputLogEntryKeys,
      'an input log entry holds atGameMs and command only',
    );
    assertInvariant(
      isGameMs(entry.atGameMs) &&
        entry.atGameMs >= previousGameMs &&
        entry.atGameMs <= state.nowGameMs,
      `input log entry at ${String(entry.atGameMs)} is in order and not after nowGameMs`,
    );
    return entry.atGameMs;
  }, 0);
}

// Full walk: only at run start, after a replay and in tests. advance and applyCommand keep
// to cheap local checks (project-context hot-path rule).
export function assertStateIsValid(state: GameState): void {
  // canonicalize is the one walker: it rejects classes, Map, Set, undefined, floats and cycles.
  canonicalize(state);
  assertHasExactKeys(state, gameStateKeys, 'the state holds the known top-level fields only');
  toRunSeed(state.seed);
  // Loops count from 1 (scripts key on "from loop 2"); "1" and 1 would fingerprint apart.
  assertInvariant(
    Number.isSafeInteger(state.loopNumber) && state.loopNumber >= 1,
    'loopNumber is a positive integer',
  );
  assertInvariant(typeof state.contentPackVersion === 'string', 'contentPackVersion is a string');
  assertStartIsValid(state.settings, state.rngStreams);
  assertInvariant(isGameMs(state.nowGameMs), 'nowGameMs is a non-negative integer');
  assertHasExactKeys(state.counters, ['event'], 'counters holds the event counter only');
  assertInvariant(isGameMs(state.counters.event), 'the event counter is a non-negative integer');
  assertQueueIsValid(state);
  assertInputLogIsValid(state);
}
