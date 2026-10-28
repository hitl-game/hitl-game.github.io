import { describe, expect, it } from 'vitest';

import { makeEconomyTuning, makeState } from '../../../tests/builders';
import { selectRunway } from './selectRunway';

const tuning = makeEconomyTuning();

describe('selectRunway', () => {
  it('derives 31 days from $12,400 at a $400 daily burn', () => {
    expect(selectRunway(makeState(), tuning)).toEqual({ kind: 'days', days: 31 });
  });

  it('floors to whole days and clamps an overdraft to zero', () => {
    expect(selectRunway(makeState({ cashCents: 39_999 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
    expect(selectRunway(makeState({ cashCents: 40_000 }), tuning)).toEqual({
      kind: 'days',
      days: 1,
    });
    expect(selectRunway(makeState({ cashCents: -40_000 }), tuning)).toEqual({
      kind: 'days',
      days: 0,
    });
  });

  it('says no burn when costs and GPU units are zero', () => {
    const free = makeEconomyTuning({
      'phases.garage.baseCostsPerDayUsd': 0,
      'phases.garage.gpuUnitCostPerDayUsd': 0,
    });

    expect(selectRunway(makeState({ gpuCapacityUnits: 0 }), free)).toEqual({ kind: 'noBurn' });
  });

  it('never reads Alignment or Hype', () => {
    const base = makeState();
    const hidden = makeState({ alignmentMilli: 5, hypeBp: 0 });

    expect(selectRunway(hidden, tuning)).toEqual(selectRunway(base, tuning));
  });
});
