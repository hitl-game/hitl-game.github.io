import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  gameMsArbitrary,
  liveStepsArbitrary,
  makeRunStart,
  makeState,
  makeStateWithEvents,
  runStartArbitrary,
  type LiveStep,
} from '../../../tests/builders';
import { advance, scheduleEvent, type DomainEvent } from '../time';
import { applyCommand } from './applyCommand';
import { assertStateIsValid } from './assertStateIsValid';
import { fingerprint } from './fingerprint';
import type { GameState } from './gameState';
import { newRun } from './newRun';
import { replay, replayFrom } from './replay';

interface LiveRun {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
  // The state right after each logged command: every one is a snapshot candidate.
  readonly snapshots: readonly GameState[];
}

// A live session: advance, apply at nowGameMs, and never advance past a blocking stop until
// a command has been logged there (the C-4 contract that makes the log replayable).
function driveLive(initial: GameState, steps: readonly LiveStep[]): LiveRun {
  let current = initial;
  let blocked = false;
  const events: DomainEvent[] = [];
  const snapshots: GameState[] = [];
  for (const step of steps) {
    if (!blocked) {
      const advanced = advance(current, current.nowGameMs + step.advanceByGameMs, 'present');
      current = advanced.state;
      events.push(...advanced.events);
      blocked = advanced.stoppedBy !== null;
    }
    const applied = applyCommand(current, step.command, current.nowGameMs);
    if (applied.ok) {
      current = applied.value.state;
      events.push(...applied.value.events);
      snapshots.push(current);
      blocked = false;
    }
  }
  return { state: current, events, snapshots };
}

// Replay ends at the last log entry; the live run may have advanced further since.
function catchUp(replayed: { state: GameState; events: readonly DomainEvent[] }, live: LiveRun) {
  if (replayed.state.nowGameMs === live.state.nowGameMs) return replayed;
  const tail = advance(replayed.state, live.state.nowGameMs, 'present');
  return { state: tail.state, events: [...replayed.events, ...tail.events] };
}

// newRun schedules no heavy decision yet (C-5); the properties add some so blocking stops
// take part in replay.
const decisionTimesArbitrary = fc.array(gameMsArbitrary, { maxLength: 4 });

const withDecisions = (state: GameState, decisionTimes: readonly number[]): GameState =>
  decisionTimes.reduce(
    (current, gameMs) => scheduleEvent(current, { gameMs, kind: 'heavyDecisionDue' }),
    state,
  );

describe('replay', () => {
  it('reproduces a live run from its start parameters and input log (DET-01)', () => {
    fc.assert(
      fc.property(runStartArbitrary, liveStepsArbitrary, (start, steps) => {
        const live = driveLive(newRun(start), steps);

        const replayed = catchUp(replay(start, live.state.inputLog), live);

        expect(fingerprint(replayed.state)).toBe(fingerprint(live.state));
        expect(replayed.events).toEqual(live.events);
      }),
    );
  });

  it('reproduces a live run through blocking stops (DET-01, DET-06)', () => {
    fc.assert(
      fc.property(
        runStartArbitrary,
        decisionTimesArbitrary,
        liveStepsArbitrary,
        (start, decisionTimes, steps) => {
          const initial = withDecisions(newRun(start), decisionTimes);
          const live = driveLive(initial, steps);

          const replayed = catchUp(replayFrom(initial, live.state.inputLog), live);

          expect(fingerprint(replayed.state)).toBe(fingerprint(live.state));
          expect(replayed.events).toEqual(live.events);
          expect(() => {
            assertStateIsValid(live.state);
          }).not.toThrow();
        },
      ),
    );
  });

  it('continues from a snapshot plus the log tail exactly like a full replay (DET-03)', () => {
    fc.assert(
      fc.property(
        fc.tuple(runStartArbitrary, decisionTimesArbitrary, liveStepsArbitrary, fc.nat()),
        ([start, decisionTimes, steps, pick]) => {
          const initial = withDecisions(newRun(start), decisionTimes);
          const live = driveLive(initial, steps);
          const fullLog = live.state.inputLog;
          const candidates = [initial, ...live.snapshots];
          const snapshot = candidates[pick % candidates.length] ?? initial;
          const tail = fullLog.slice(snapshot.inputLog.length);

          const fromSnapshot = replayFrom(snapshot, tail);
          const full = replayFrom(initial, fullLog);

          expect(fingerprint(fromSnapshot.state)).toBe(fingerprint(full.state));
          expect(fromSnapshot.state.inputLog).toEqual(fullLog);
        },
      ),
    );
  });

  it('returns the folded domain events in production order', () => {
    const start = makeRunStart();
    const live = driveLive(newRun(start), [
      { advanceByGameMs: 70_000, command: { type: 'changeGameSpeed', speed: 'half' } },
      { advanceByGameMs: 60_000, command: { type: 'changeTiming', timing: 'relaxed' } },
    ]);

    const replayed = replay(start, live.state.inputLog);

    expect(replayed.events).toEqual([
      { type: 'gameDayStarted', atGameMs: 60_000 },
      { type: 'gameDayStarted', atGameMs: 120_000 },
    ]);
    expect(replayed.state.settings).toEqual({ timing: 'relaxed', gameSpeed: 'half' });
  });

  it('treats a logged command the core rejects as a corrupt log', () => {
    const corrupt = [
      { atGameMs: 0, command: { type: 'changeTiming', timing: 'standard' } },
    ] as const;

    expect(() => replayFrom(makeState(), corrupt)).toThrow(/corrupt/);
  });

  it('treats a log entry after an unresolved blocking stop as a corrupt log', () => {
    const blockedAt100 = makeStateWithEvents([{ gameMs: 100, kind: 'heavyDecisionDue' }]);
    const log = [{ atGameMs: 200, command: { type: 'changeGameSpeed', speed: 'half' } }] as const;

    expect(() => replayFrom(blockedAt100, log)).toThrow(/unresolved blocking stop/);
  });
});
