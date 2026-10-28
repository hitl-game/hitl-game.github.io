import * as fc from 'fast-check';

import {
  GAME_DAY_MS,
  gameSpeeds,
  RUN_SEED_MAX,
  timings,
  toRunSeed,
  type Command,
  type PendingEvent,
  type RunStart,
  type Settings,
} from '../../src/core';

// canonicalize accepts Object.prototype objects only, as every command and save record has.
const plain = { noNullPrototype: true } as const;

const maxHorizonGameMs = 20 * GAME_DAY_MS;

export const runSeedArbitrary = fc.integer({ min: 0, max: RUN_SEED_MAX }).map(toRunSeed);

const settingsArbitrary: fc.Arbitrary<Settings> = fc.record(
  { timing: fc.constantFrom(...timings), gameSpeed: fc.constantFrom(...gameSpeeds) },
  plain,
);

export const runStartArbitrary: fc.Arbitrary<RunStart> = fc.record(
  {
    seed: runSeedArbitrary,
    loopNumber: fc.integer({ min: 1, max: 99 }),
    contentPackVersion: fc.constantFrom('pack-a', 'pack-b'),
    settings: settingsArbitrary,
  },
  plain,
);

const commandArbitrary: fc.Arbitrary<Command> = fc.oneof(
  fc.record(
    { type: fc.constant('changeGameSpeed' as const), speed: fc.constantFrom(...gameSpeeds) },
    plain,
  ),
  fc.record(
    { type: fc.constant('changeTiming' as const), timing: fc.constantFrom(...timings) },
    plain,
  ),
);

export const gameMsArbitrary = fc.integer({ min: 0, max: maxHorizonGameMs });

const pendingEventArbitrary: fc.Arbitrary<PendingEvent> = fc.record(
  {
    gameMs: gameMsArbitrary,
    kind: fc.constantFrom('dayBoundary', 'economyStep', 'heavyDecisionDue'),
  },
  plain,
);

export const pendingEventsArbitrary = fc.array(pendingEventArbitrary, { maxLength: 12 });

// t1 <= t2, both within the horizon.
export const timeSplitArbitrary = fc
  .tuple(gameMsArbitrary, gameMsArbitrary)
  .map(([a, b]): readonly [number, number] => (a <= b ? [a, b] : [b, a]));

export interface LiveStep {
  readonly advanceByGameMs: number;
  readonly command: Command;
}

// Non-decreasing command times by construction; commands may be no-ops (rejected, not logged).
export const liveStepsArbitrary = fc.array(
  fc.record<LiveStep>(
    { advanceByGameMs: fc.integer({ min: 0, max: 3 * GAME_DAY_MS }), command: commandArbitrary },
    plain,
  ),
  { maxLength: 16 },
);
