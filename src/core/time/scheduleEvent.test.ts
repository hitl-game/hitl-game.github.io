import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeState, makeStateWithEvents, pendingEventsArbitrary } from '../../../tests/builders';
import { compareQueuedEvents } from './compareQueuedEvents';
import { scheduleEvent } from './scheduleEvent';

describe('scheduleEvent', () => {
  it('takes the next zero-padded id from the counter and returns a new state', () => {
    const state = makeState();

    const next = scheduleEvent(state, { gameMs: 5, kind: 'heavyDecisionDue' });

    expect(next).not.toBe(state);
    expect(next.counters.event).toBe(state.counters.event + 1);
    expect(next.queue.map((event) => event.id)).toEqual(['evt-000003', 'evt-000001', 'evt-000002']);
    expect(state.queue).toHaveLength(2);
  });

  it('stores a negative-zero time as 0', () => {
    const next = scheduleEvent(makeState(), { gameMs: -0, kind: 'heavyDecisionDue' });

    expect(next.queue.some((event) => Object.is(event.gameMs, -0))).toBe(false);
  });

  it('keeps the queue sorted whatever the insertion order', () => {
    fc.assert(
      fc.property(pendingEventsArbitrary, (pending) => {
        const { queue } = makeStateWithEvents(pending);

        for (let i = 1; i < queue.length; i += 1) {
          const previous = queue[i - 1];
          const current = queue[i];
          if (previous !== undefined && current !== undefined) {
            expect(compareQueuedEvents(previous, current)).toBeLessThan(0);
          }
        }
        expect(new Set(queue.map((event) => event.id)).size).toBe(queue.length);
      }),
    );
  });

  it('treats scheduling in the past as a bug', () => {
    const state = makeState({ nowGameMs: 100 });

    expect(() => scheduleEvent(state, { gameMs: 99, kind: 'dayBoundary' })).toThrow(
      /at or after nowGameMs/,
    );
  });
});
