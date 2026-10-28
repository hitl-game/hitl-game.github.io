import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { makeEvent } from '../../../tests/builders';
import { compareQueuedEvents } from './compareQueuedEvents';
import { eventKinds, type EventKind } from './eventKinds';
import { formatEventId } from './formatEventId';
import type { QueuedEvent } from './queuedEvent';

const kinds = Object.keys(eventKinds) as readonly EventKind[];

const queuedEventArbitrary: fc.Arbitrary<QueuedEvent> = fc.record({
  id: fc.integer({ min: 1, max: 999_999 }).map(formatEventId),
  gameMs: fc.integer({ min: 0, max: 5 }),
  kind: fc.constantFrom(...kinds),
});

// An independent oracle: the tuple as one zero-padded string, compared lexicographically.
function sortKeyOf(event: QueuedEvent): string {
  const gameMs = String(event.gameMs).padStart(8, '0');
  const priority = String(eventKinds[event.kind].priority).padStart(3, '0');
  return `${gameMs}|${priority}|${event.id}`;
}

function compareByTupleKey(a: QueuedEvent, b: QueuedEvent): number {
  const [keyA, keyB] = [sortKeyOf(a), sortKeyOf(b)];
  if (keyA === keyB) return 0;
  return keyA < keyB ? -1 : 1;
}

describe('compareQueuedEvents', () => {
  it('orders by gameMs first', () => {
    const early = makeEvent({ id: formatEventId(9), gameMs: 10, kind: 'heavyDecisionDue' });
    const late = makeEvent({ id: formatEventId(1), gameMs: 20, kind: 'dayBoundary' });

    expect(compareQueuedEvents(early, late)).toBeLessThan(0);
    expect(compareQueuedEvents(late, early)).toBeGreaterThan(0);
  });

  it('orders by kind priority at the same gameMs', () => {
    const day = makeEvent({ id: formatEventId(9), gameMs: 10, kind: 'dayBoundary' });
    const decision = makeEvent({ id: formatEventId(1), gameMs: 10, kind: 'heavyDecisionDue' });

    expect(compareQueuedEvents(day, decision)).toBeLessThan(0);
  });

  it('orders by id, in creation order, when gameMs and kind match', () => {
    const first = makeEvent({ id: formatEventId(2), gameMs: 10 });
    const second = makeEvent({ id: formatEventId(10), gameMs: 10 });

    expect(compareQueuedEvents(first, second)).toBeLessThan(0);
    expect(compareQueuedEvents(second, first)).toBeGreaterThan(0);
    expect(compareQueuedEvents(first, first)).toBe(0);
  });

  it('agrees with lexicographic order on (gameMs, kind priority, id)', () => {
    fc.assert(
      fc.property(queuedEventArbitrary, queuedEventArbitrary, (a, b) => {
        expect(Math.sign(compareQueuedEvents(a, b))).toBe(compareByTupleKey(a, b));
      }),
    );
  });
});
