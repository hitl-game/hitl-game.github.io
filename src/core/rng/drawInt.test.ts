import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runSeedArbitrary } from '../../../tests/builders';
import { rngStreamNames } from '../constants';
import { deriveRngStreams } from './deriveRngStreams';
import { drawInt } from './drawInt';
import { drawIntFromStreams } from './drawIntFromStreams';
import type { RngStreamName, RngStreams } from './rngStreams';

const streamNameArbitrary = fc.constantFrom(...rngStreamNames);
const rangeArbitrary = fc
  .tuple(fc.integer({ min: -1000, max: 1000 }), fc.integer({ min: -1000, max: 1000 }))
  .map(([a, b]) => (a <= b ? { min: a, max: b } : { min: b, max: a }));

function drawMany(streams: RngStreams, name: RngStreamName, count: number): RngStreams {
  let current = streams;
  for (let i = 0; i < count; i += 1) {
    [, current] = drawIntFromStreams(current, name, { min: 0, max: 99 });
  }
  return current;
}

describe('drawInt', () => {
  it('returns the same value for the same stream state and leaves the state untouched', () => {
    const streams = deriveRngStreams(3);
    const before = [...streams.deck];

    const [first] = drawInt(streams.deck, 0, 1_000_000);
    const [second] = drawInt(streams.deck, 0, 1_000_000);

    expect(first).toBe(second);
    expect(streams.deck).toEqual(before);
  });

  it('produces different sequences on different streams of the same seed', () => {
    const streams = deriveRngStreams(11);
    const sequenceOf = (name: RngStreamName): number[] => {
      const values: number[] = [];
      let state = streams[name];
      for (let i = 0; i < 8; i += 1) {
        const [value, next] = drawInt(state, 0, 1_000_000);
        values.push(value);
        state = next;
      }
      return values;
    };

    expect(sequenceOf('messages')).not.toEqual(sequenceOf('deck'));
  });

  it('stays within the inclusive bounds', () => {
    fc.assert(
      fc.property(runSeedArbitrary, streamNameArbitrary, rangeArbitrary, (seed, name, range) => {
        const [value, next] = drawInt(deriveRngStreams(seed)[name], range.min, range.max);

        expect(Number.isSafeInteger(value)).toBe(true);
        expect(value).toBeGreaterThanOrEqual(range.min);
        expect(value).toBeLessThanOrEqual(range.max);
        expect(next.every((word) => Number.isSafeInteger(word))).toBe(true);
      }),
    );
  });

  it('treats an empty range as a bug', () => {
    expect(() => drawInt(deriveRngStreams(1).deck, 5, 4)).toThrow(/min <= max/);
  });
});

describe('drawIntFromStreams', () => {
  it('never changes the draws of another stream, however many draws are taken (DET-05)', () => {
    fc.assert(
      fc.property(
        runSeedArbitrary,
        streamNameArbitrary,
        fc.integer({ min: 1, max: 20 }),
        (seed, drawnName, count) => {
          const streams = deriveRngStreams(seed);
          const after = drawMany(streams, drawnName, count);

          for (const other of rngStreamNames.filter((name) => name !== drawnName)) {
            expect(after[other]).toBe(streams[other]);
            expect(drawIntFromStreams(after, other, { min: 0, max: 99 })[0]).toBe(
              drawIntFromStreams(streams, other, { min: 0, max: 99 })[0],
            );
          }
          expect(after[drawnName]).not.toEqual(streams[drawnName]);
        },
      ),
    );
  });
});
