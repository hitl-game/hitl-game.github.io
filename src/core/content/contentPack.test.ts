import { describe, expect, it } from 'vitest';

import { makeContentPack } from '../../../tests/builders';
import { computeContentPackVersion } from './contentPack';

describe('computeContentPackVersion', () => {
  it('keeps the hashing path stable', () => {
    expect(
      computeContentPackVersion({ tuning: { start: { cashCents: 1_240_000 } } }),
    ).toMatchInlineSnapshot(`"262f3e1ec8c5c6583c0649f5e228113973e21b8ef1724eaada931a6e3323939a"`);
  });

  it('is the full 64-character lowercase SHA-256 hex', () => {
    expect(computeContentPackVersion(makeContentPack())).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ignores key order', () => {
    expect(computeContentPackVersion({ a: 1, b: { c: 2, d: 3 } })).toBe(
      computeContentPackVersion({ b: { d: 3, c: 2 }, a: 1 }),
    );
  });

  it('hashes a pack the Zod schema transformed', () => {
    const pack = makeContentPack();

    expect(computeContentPackVersion(pack)).toBe(computeContentPackVersion(makeContentPack()));
    expect(computeContentPackVersion(makeContentPack({ 'start.cashUsd': 12_401 }))).not.toBe(
      computeContentPackVersion(pack),
    );
  });

  it('throws on a float that slipped into the pack', () => {
    expect(() => computeContentPackVersion({ tuning: { churnPerDayBp: 0.1 } })).toThrow(
      /safe integers/,
    );
  });
});
