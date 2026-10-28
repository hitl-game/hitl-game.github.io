import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  gameMsArbitrary,
  liveStepsArbitrary,
  makeAdvanceContext,
  makeEconomyTuning,
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

const tuning = makeEconomyTuning();
const present = makeAdvanceContext();

interface LiveRun {
  readonly state: GameState;
  readonly events: readonly DomainEvent[];
  // The state right after each logged command: every one is a snapshot candidate.
  readonly snapshots: readonly GameState[];
  // Where the last advance after the last logged command was aimed, or null if there was none.
  readonly trailingUntilGameMs: number | null;
}

// A live session: advance, apply at nowGameMs, and never advance past a blocking stop until
// a command has been logged there (the C-4 contract that makes the log replayable).
function driveLive(initial: GameState, steps: readonly LiveStep[]): LiveRun {
  let current = initial;
  let blocked = false;
  let trailingUntilGameMs: number | null = null;
  const events: DomainEvent[] = [];
  const snapshots: GameState[] = [];
  for (const step of steps) {
    if (!blocked) {
      trailingUntilGameMs = current.nowGameMs + step.advanceByGameMs;
      const advanced = advance(current, trailingUntilGameMs, present);
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
      trailingUntilGameMs = null;
    }
  }
  return { state: current, events, snapshots, trailingUntilGameMs };
}

// Replay ends at the last log entry. Equal times do not mean equal states (a zero-length
// advance can still process a second blocking event at the same gameMs), so repeat the live
// run's trailing advance exactly; chunk invariance makes one advance equal to several.
function catchUp(replayed: { state: GameState; events: readonly DomainEvent[] }, live: LiveRun) {
  if (live.trailingUntilGameMs === null) return replayed;
  const tail = advance(replayed.state, live.trailingUntilGameMs, present);
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
        const live = driveLive(newRun(start, tuning), steps);

        const replayed = catchUp(replay(start, live.state.inputLog, tuning), live);

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
          const initial = withDecisions(newRun(start, tuning), decisionTimes);
          const live = driveLive(initial, steps);

          const replayed = catchUp(replayFrom(initial, live.state.inputLog, tuning), live);

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
          const initial = withDecisions(newRun(start, tuning), decisionTimes);
          const live = driveLive(initial, steps);
          const fullLog = live.state.inputLog;
          const candidates = [initial, ...live.snapshots];
          const snapshot = candidates[pick % candidates.length] ?? initial;
          const tail = fullLog.slice(snapshot.inputLog.length);

          const fromSnapshot = replayFrom(snapshot, tail, tuning);
          const full = replayFrom(initial, fullLog, tuning);

          expect(fingerprint(fromSnapshot.state)).toBe(fingerprint(full.state));
          expect(fromSnapshot.state.inputLog).toEqual(fullLog);
        },
      ),
    );
  });

  it('matches a live run whose trailing zero-length advance opens a second decision at the same gameMs', () => {
    const initial = withDecisions(newRun(makeRunStart(), tuning), [100, 100]);
    const live = driveLive(initial, [
      { advanceByGameMs: 100, command: { type: 'changeGameSpeed', speed: 'half' } },
      { advanceByGameMs: 0, command: { type: 'changeGameSpeed', speed: 'half' } },
    ]);

    const replayed = catchUp(replayFrom(initial, live.state.inputLog, tuning), live);

    expect(live.state.queue.some((event) => event.kind === 'heavyDecisionDue')).toBe(false);
    expect(fingerprint(replayed.state)).toBe(fingerprint(live.state));
    expect(replayed.events).toEqual(live.events);
  });

  it('returns the folded domain events in production order', () => {
    const start = makeRunStart();
    const live = driveLive(newRun(start, tuning), [
      { advanceByGameMs: 70_000, command: { type: 'changeGameSpeed', speed: 'half' } },
      { advanceByGameMs: 60_000, command: { type: 'changeTiming', timing: 'relaxed' } },
    ]);

    const replayed = replay(start, live.state.inputLog, tuning);

    expect(replayed.events).toEqual([
      { type: 'gameDayStarted', atGameMs: 60_000 },
      { type: 'dailyEconomyApplied', atGameMs: 60_000, cashChangeCents: -40_000 },
      { type: 'gameDayStarted', atGameMs: 120_000 },
      { type: 'dailyEconomyApplied', atGameMs: 120_000, cashChangeCents: -40_000 },
    ]);
    expect(replayed.state.settings).toEqual({ timing: 'relaxed', gameSpeed: 'half' });
  });

  it('treats a logged command the core rejects as a corrupt log', () => {
    const corrupt = [
      { atGameMs: 0, command: { type: 'changeTiming', timing: 'standard' } },
    ] as const;

    expect(() => replayFrom(makeState(), corrupt, tuning)).toThrow(/corrupt/);
  });

  it('rejects a corrupt snapshot even when replay would consume the corruption', () => {
    // The stale counter would let the day boundary reschedule as evt-000001 and look valid.
    const staleCounter: GameState = { ...makeState(), counters: { event: 0 } };
    const log = [
      { atGameMs: 60_000, command: { type: 'changeGameSpeed', speed: 'half' } },
    ] as const;

    expect(() => replayFrom(staleCounter, log, tuning)).toThrow(/already counted/);
  });

  it('treats a log entry after an unresolved blocking stop as a corrupt log', () => {
    const blockedAt100 = makeStateWithEvents([{ gameMs: 100, kind: 'heavyDecisionDue' }]);
    const log = [{ atGameMs: 200, command: { type: 'changeGameSpeed', speed: 'half' } }] as const;

    expect(() => replayFrom(blockedAt100, log, tuning)).toThrow(/unresolved blocking stop/);
  });
});
