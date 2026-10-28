import { describe, expect, it } from 'vitest';

import { makeContentPack, makeTuningInput, type TuningOverrides } from '../../../../tests/builders';
import { GAME_DAY_MS, phases } from '../../constants';
import { tuningSchema } from '.';

const issuesOf = (overrides: TuningOverrides) => {
  const parsed = tuningSchema.safeParse(makeTuningInput(overrides));
  return parsed.success
    ? []
    : parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        code: issue.code,
        message: issue.message,
      }));
};

const collectNumbers = (value: unknown): number[] => {
  if (typeof value === 'number') return [value];
  if (typeof value !== 'object' || value === null) return [];
  return Object.values(value).flatMap(collectNumbers);
};

describe('tuning schema', () => {
  const { tuning } = makeContentPack();

  it('compiles the start values of Story 1.5 to integers', () => {
    expect(tuning.start).toEqual({
      cashCents: 1_240_000,
      hypeBp: 2_000,
      alignmentMilli: 100_000,
      gpuCapacityUnits: 1,
    });
  });

  it('gives a 31-day Garage runway: base costs plus one GPU burn 40,000 cents a day', () => {
    const garage = tuning.phases.garage;
    const burnPerDayCents = garage.baseCostsPerDayCents + garage.gpuUnitCostPerDayCents;

    expect(burnPerDayCents).toBe(40_000);
    expect(burnPerDayCents * 31).toBe(tuning.start.cashCents);
  });

  it('stores every phase under the core phase names', () => {
    expect(Object.keys(tuning.phases)).toEqual([...phases]);
  });

  it('compiles human units to integer units with the integer suffix', () => {
    expect(tuning.phases.seriesA.alignmentDriftPhaseMultiplierBp).toBe(15_000);
    expect(tuning.phases.garage.messageArrivalIntervalGameMs).toEqual({ min: 10_000, max: 15_000 });
    expect(tuning.phases.garage.eventIntervalGameMs).toEqual({ min: 180_000, max: 240_000 });
    expect(tuning.customers.baselineChurnPerDayBp).toBe(10);
    expect(tuning.customers.newCustomersPerDayPerHypePointMilli).toBe(100);
    expect(tuning.compute.metisAnswerLoadMilli).toBe(500);
    expect(tuning.economy.headcountBurnExponentBp).toBe(12_000);
    expect(tuning.economy.belowZeroLimitGameMs).toBe(14 * GAME_DAY_MS);
    expect(tuning.investors.responsibleVenturesClause.graceGameMs).toBe(600_000);
    expect(tuning.messages.backlogTopItemWindowRealMs).toEqual({ min: 10_000, max: 15_000 });
    expect(tuning.alignment.drift.lowStakesMilli).toBe(-20);
    expect(tuning.hype.valuationMultiple.high).toEqual({
      hypeBp: 9_000,
      valuationMultiplierBp: 600_000,
    });
  });

  it('holds only safe integers', () => {
    const numbers = collectNumbers(tuning);

    expect(numbers.length).toBeGreaterThan(100);
    expect(numbers.every((value) => Number.isSafeInteger(value))).toBe(true);
  });

  it('rejects an unknown key, so a typo never becomes a silent default', () => {
    expect(issuesOf({ 'start.cashDollars': 12_400 })).toEqual([
      expect.objectContaining({ field: 'start', code: 'unrecognized_keys' }),
    ]);
  });

  it('rejects a missing key with its field path', () => {
    const input = makeTuningInput();
    const parsed = tuningSchema.safeParse({ ...input, spine: { minBeatGapDays: 3 } });

    expect(parsed.success ? [] : parsed.error.issues.map((issue) => issue.path.join('.'))).toEqual([
      'spine.roundCooldownDays',
    ]);
  });

  it.each([
    ['a string', '350'],
    ['a boolean', true],
    ['null', null],
  ])('rejects %s where a number is expected, with the field path', (_label, value) => {
    expect(issuesOf({ 'phases.garage.baseCostsPerDayUsd': value })).toEqual([
      expect.objectContaining({ field: 'phases.garage.baseCostsPerDayUsd', code: 'invalid_type' }),
    ]);
  });

  it('rejects a value that is not a whole number of cents, with the field and the reason', () => {
    expect(issuesOf({ 'phases.garage.baseCostsPerDayUsd': 0.001 })).toEqual([
      {
        field: 'phases.garage.baseCostsPerDayUsd',
        code: 'custom',
        message: '0.001 is not a whole number of cents',
      },
    ]);
  });

  it('rejects a fractional count', () => {
    expect(issuesOf({ 'start.gpuCapacityUnits': 1.5 })).toEqual([
      expect.objectContaining({
        field: 'start.gpuCapacityUnits',
        message: 'must be a whole number',
      }),
    ]);
  });

  it('stores a negative zero as a canonical zero, in counts and in converted units', () => {
    const { tuning: zeroed } = makeContentPack({
      'meta.aegisVersionOffset': -0,
      'start.cashUsd': -0,
    });

    expect(Object.is(zeroed.meta.aegisVersionOffset, 0)).toBe(true);
    expect(Object.is(zeroed.start.cashCents, 0)).toBe(true);
  });

  it.each([
    { label: 'a zero billing month', field: 'economy.billingMonthDays', value: 0, min: 1 },
    { label: 'a negative billing month', field: 'economy.billingMonthDays', value: -30, min: 1 },
    { label: 'negative starting cash', field: 'start.cashUsd', value: -1, min: 0 },
    { label: 'a negative starting Hype', field: 'start.hypeIndex', value: -5, min: 0 },
    { label: 'a negative starting Alignment', field: 'start.alignmentPoints', value: -1, min: 0 },
    { label: 'negative starting GPU units', field: 'start.gpuCapacityUnits', value: -3, min: 0 },
    { label: 'negative base costs', field: 'phases.seed.baseCostsPerDayUsd', value: -0.01, min: 0 },
    {
      label: 'a negative GPU unit cost',
      field: 'phases.garage.gpuUnitCostPerDayUsd',
      value: -50,
      min: 0,
    },
  ])(
    'rejects $label, which the economy would divide by, burn backwards or reject at run start',
    (row) => {
      expect(issuesOf({ [row.field]: row.value })).toEqual([
        expect.objectContaining({
          field: row.field,
          message: `must be at least ${String(row.min)}`,
        }),
      ]);
    },
  );

  it('rejects a fractional-day billing month: the daily step divides MRR by whole days', () => {
    expect(issuesOf({ 'economy.billingMonthDays': 1.5 })).toEqual([
      expect.objectContaining({
        field: 'economy.billingMonthDays',
        message: 'must be a whole number',
      }),
    ]);
  });

  it('accepts the bounds themselves: a one-day month and free costs', () => {
    const { tuning: edge } = makeContentPack({
      'economy.billingMonthDays': 1,
      'start.cashUsd': 0,
      'phases.garage.baseCostsPerDayUsd': 0,
      'phases.garage.gpuUnitCostPerDayUsd': 0,
    });

    expect(edge.economy.billingMonthGameMs).toBe(GAME_DAY_MS);
    expect(edge.start.cashCents).toBe(0);
    expect(edge.phases.garage.baseCostsPerDayCents).toBe(0);
  });

  it('rejects a range whose min exceeds its max', () => {
    expect(issuesOf({ 'messages.backlogCapMessages': { min: 20, max: 15 } })).toEqual([
      expect.objectContaining({
        field: 'messages.backlogCapMessages',
        message: 'min must not exceed max',
      }),
    ]);
  });

  it('rejects an extra key inside a range', () => {
    expect(issuesOf({ 'messages.backlogCapMessages': { min: 15, max: 20, typical: 17 } })).toEqual([
      expect.objectContaining({ field: 'messages.backlogCapMessages' }),
    ]);
  });
});
