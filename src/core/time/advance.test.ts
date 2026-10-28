import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import {
  makeState,
  makeStateWithEvents,
  runStartArbitrary,
  pendingEventsArbitrary,
  timeSplitArbitrary,
} from '../../../tests/builders';
import { GAME_DAY_MS } from '../constants';
import { fingerprint, type GameState } from '../run';
import { advance, type AdvanceResult } from './advance';
import type { AdvanceMode } from './advanceMode';
import type { DomainEvent } from './domainEvent';
import { eventKinds } from './eventKinds';
import { scheduleEvent } from './scheduleEvent';

const modes: readonly AdvanceMode[] = ['present', 'away', 'ending'];

// Resumes after every blocking stop; what a live session does once a stop is handled.
function advanceResuming(state: GameState, untilGameMs: number): AdvanceResult<GameState> {
  let result = advance(state, untilGameMs, 'present');
  const events = [...result.events];
  while (result.stoppedBy !== null) {
    result = advance(result.state, untilGameMs, 'present');
    events.push(...result.events);
  }
  return { ...result, events };
}

// A blocking stop in the first step is final: a live session cannot step past it on its own.
function advanceInTwoSteps(state: GameState, t1: number, t2: number): AdvanceResult<GameState> {
  const first = advance(state, t1, 'present');
  if (first.stoppedBy !== null) return first;
  const second = advance(first.state, t2, 'present');
  return { ...second, events: [...first.events, ...second.events] };
}

describe('advance', () => {
  it('moves nowGameMs to untilGameMs when nothing is due', () => {
    const state = makeState();

    const result = advance(state, GAME_DAY_MS - 1, 'present');

    expect(result.state.nowGameMs).toBe(GAME_DAY_MS - 1);
    expect(result.events).toEqual([]);
    expect(result.stoppedBy).toBeNull();
    expect(result.state.queue).toEqual(state.queue);
  });

  it('emits gameDayStarted at each day boundary and schedules the next one', () => {
    const result = advance(makeState(), 2 * GAME_DAY_MS, 'present');

    expect(result.events).toEqual([
      { type: 'gameDayStarted', atGameMs: GAME_DAY_MS },
      { type: 'gameDayStarted', atGameMs: 2 * GAME_DAY_MS },
    ]);
    expect(result.state.queue).toEqual([
      { id: 'evt-000003', gameMs: 3 * GAME_DAY_MS, kind: 'dayBoundary' },
    ]);
  });

  it('stops at the first blocking event and leaves later events queued', () => {
    const state = makeStateWithEvents([
      { gameMs: 500, kind: 'heavyDecisionDue' },
      { gameMs: 700, kind: 'heavyDecisionDue' },
    ]);

    const result = advance(state, GAME_DAY_MS, 'present');

    expect(result.stoppedBy).toEqual({
      kind: 'heavyDecisionDue',
      eventId: 'evt-000002',
      atGameMs: 500,
    });
    expect(result.state.nowGameMs).toBe(500);
    expect(result.events).toEqual([{ type: 'heavyDecisionOpened', atGameMs: 500 }]);
    expect(result.state.queue.map((event) => event.id)).toEqual(['evt-000003', 'evt-000001']);
  });

  it('resumes after a blocking stop without re-processing it', () => {
    const state = makeStateWithEvents([{ gameMs: 500, kind: 'heavyDecisionDue' }]);
    const stopped = advance(state, GAME_DAY_MS, 'present');

    const resumed = advance(stopped.state, GAME_DAY_MS, 'present');

    expect(resumed.stoppedBy).toBeNull();
    expect(resumed.state.nowGameMs).toBe(GAME_DAY_MS);
    expect(resumed.events).toEqual([{ type: 'gameDayStarted', atGameMs: GAME_DAY_MS }]);
  });

  it('runs a day boundary before a heavy decision due at the same gameMs, then stops', () => {
    const state = makeStateWithEvents([{ gameMs: GAME_DAY_MS, kind: 'heavyDecisionDue' }]);

    const result = advance(state, 5 * GAME_DAY_MS, 'present');

    expect(result.events).toEqual([
      { type: 'gameDayStarted', atGameMs: GAME_DAY_MS },
      { type: 'heavyDecisionOpened', atGameMs: GAME_DAY_MS },
    ]);
    expect(result.stoppedBy?.eventId).toBe('evt-000002');
    expect(result.state.nowGameMs).toBe(GAME_DAY_MS);
  });

  it('processes ties in (gameMs, kind priority, id) order whatever the insertion order (DET-04)', () => {
    // Below the first day boundary no handler reschedules inside the horizon, so the initial
    // queue alone predicts the events.
    const horizonGameMs = GAME_DAY_MS - 1;
    fc.assert(
      fc.property(runStartArbitrary, pendingEventsArbitrary, (start, pending) => {
        const state = makeStateWithEvents(pending, start);
        const expected: DomainEvent[] = [...state.queue]
          .sort(
            (a, b) =>
              a.gameMs - b.gameMs ||
              eventKinds[a.kind].priority - eventKinds[b.kind].priority ||
              (a.id < b.id ? -1 : 1),
          )
          .filter((event) => event.gameMs <= horizonGameMs)
          .map((event) => ({
            type: event.kind === 'dayBoundary' ? 'gameDayStarted' : 'heavyDecisionOpened',
            atGameMs: event.gameMs,
          }));

        expect(advanceResuming(state, horizonGameMs).events).toEqual(expected);
      }),
    );
  });

  it('is chunk invariant: advancing in two steps equals one step (DET-02)', () => {
    fc.assert(
      fc.property(
        runStartArbitrary,
        pendingEventsArbitrary,
        timeSplitArbitrary,
        (start, pending, [t1, t2]) => {
          const state = makeStateWithEvents(pending, start);
          const whole = advance(state, t2, 'present');
          const stepwise = advanceInTwoSteps(state, t1, t2);

          expect(fingerprint(stepwise.state)).toBe(fingerprint(whole.state));
          expect(stepwise.events).toEqual(whole.events);
          expect(stepwise.stoppedBy).toEqual(whole.stoppedBy);
        },
      ),
    );
  });

  it('gives the same result for one 14-day jump as for 14 single-day steps', () => {
    const start = makeStateWithEvents([{ gameMs: 3 * GAME_DAY_MS + 7, kind: 'heavyDecisionDue' }]);
    const jump = advanceResuming(start, 14 * GAME_DAY_MS);

    let stepwise: AdvanceResult<GameState> = { state: start, events: [], stoppedBy: null };
    for (let day = 1; day <= 14; day += 1) {
      const step = advanceResuming(stepwise.state, day * GAME_DAY_MS);
      stepwise = { ...step, events: [...stepwise.events, ...step.events] };
    }

    expect(fingerprint(stepwise.state)).toBe(fingerprint(jump.state));
    expect(stepwise.events).toEqual(jump.events);
    expect(jump.events).toHaveLength(15);
  });

  it('accepts present, away and ending and, for now, treats them alike', () => {
    const state = makeStateWithEvents([{ gameMs: 2 * GAME_DAY_MS, kind: 'heavyDecisionDue' }]);

    const results = modes.map((mode) => advance(state, 3 * GAME_DAY_MS, mode));

    for (const result of results) {
      expect(fingerprint(result.state)).toBe(fingerprint(results[0]?.state ?? state));
      expect(result.events).toEqual(results[0]?.events);
      expect(result.stoppedBy).toEqual(results[0]?.stoppedBy);
    }
  });

  it('treats moving time backwards as a bug', () => {
    const state = scheduleEvent(makeState({ nowGameMs: 10 }), { gameMs: 10, kind: 'dayBoundary' });

    expect(() => advance(state, 9, 'present')).toThrow(/never moves time backwards/);
  });
});
