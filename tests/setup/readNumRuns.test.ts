import { readConfigureGlobal } from 'fast-check';
import { describe, expect, it } from 'vitest';
import { readNumRuns } from './readNumRuns.ts';

describe('readNumRuns', () => {
  it('defaults to 100 runs when FC_NUM_RUNS is unset or blank', () => {
    expect(readNumRuns(undefined)).toBe(100);
    expect(readNumRuns('')).toBe(100);
    expect(readNumRuns('  ')).toBe(100);
  });

  it('uses the configured positive integer', () => {
    expect(readNumRuns('10000')).toBe(10000);
  });

  it.each(['abc', '0', '-5', '1.5'])('rejects %j instead of silently weakening the run', (raw) => {
    expect(() => readNumRuns(raw)).toThrow('FC_NUM_RUNS must be a positive integer');
  });

  it('applies the configured run count to fast-check globally', () => {
    expect(readConfigureGlobal().numRuns).toBe(readNumRuns(process.env['FC_NUM_RUNS']));
  });
});
