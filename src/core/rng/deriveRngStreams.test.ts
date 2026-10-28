import * as fc from 'fast-check';
import { describe, expect, it } from 'vitest';

import { runSeedArbitrary } from '../../../tests/builders';
import { RNG_STATE_WORDS, rngStreamNames } from '../constants';
import { deriveRngStreams } from './deriveRngStreams';

describe('deriveRngStreams', () => {
  it('derives one plain-data state of four safe integers per released stream name', () => {
    const streams = deriveRngStreams(7);

    expect(Object.keys(streams).sort()).toEqual([...rngStreamNames].sort());
    for (const name of rngStreamNames) {
      expect(streams[name]).toHaveLength(RNG_STATE_WORDS);
      expect(streams[name].every((word) => Number.isSafeInteger(word))).toBe(true);
    }
  });

  it('is a pure function of the run seed', () => {
    fc.assert(
      fc.property(runSeedArbitrary, (seed) => {
        expect(deriveRngStreams(seed)).toEqual(deriveRngStreams(seed));
      }),
    );
  });

  it('gives every stream name a different state (hash(runSeed, streamName))', () => {
    fc.assert(
      fc.property(runSeedArbitrary, (seed) => {
        const streams = deriveRngStreams(seed);
        const distinct = new Set(rngStreamNames.map((name) => streams[name].join(',')));

        expect(distinct.size).toBe(rngStreamNames.length);
      }),
    );
  });

  it('changes every stream when the seed changes', () => {
    fc.assert(
      fc.property(runSeedArbitrary, runSeedArbitrary, (seedA, seedB) => {
        fc.pre(seedA !== seedB);
        const a = deriveRngStreams(seedA);
        const b = deriveRngStreams(seedB);

        for (const name of rngStreamNames) expect(a[name]).not.toEqual(b[name]);
      }),
    );
  });

  it('keeps the released derivation of every stream stable', () => {
    expect(deriveRngStreams(0)).toMatchInlineSnapshot(`
      {
        "candidates": [
          -1728117842,
          844258865,
          -473903462,
          -319099435,
        ],
        "deck": [
          1038806012,
          73942708,
          -2135625990,
          1874315096,
        ],
        "documents": [
          256672761,
          -1270919957,
          2082087022,
          1620758433,
        ],
        "headlines": [
          786721096,
          -730211628,
          1442575060,
          -1315349017,
        ],
        "investors": [
          -573277543,
          1417491737,
          -285613619,
          -1621396581,
        ],
        "messages": [
          850969216,
          1626052019,
          1738153037,
          -1891032340,
        ],
        "outcomes": [
          1149956239,
          750562475,
          -533082673,
          -1543977940,
        ],
      }
    `);
  });
});
