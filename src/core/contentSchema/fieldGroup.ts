import * as z from 'zod';

import { withoutNegativeZero } from '../numerics';
import {
  activeMinutesToGameMs,
  alignmentPointsToMilli,
  daysToGameMs,
  hypeIndexToBp,
  multiplierToBp,
  percentToBp,
  secondsToGameMs,
  secondsToRealMs,
  toMilli,
  usdToCents,
  type Conversion,
} from './exactUnits';

interface FieldUnit {
  readonly humanSuffix: string;
  readonly integerSuffix: string;
  readonly convert: ((value: number) => Conversion) | null;
}

// The one place a field's unit lives: the YAML key, the compiled key and the JSON Schema all
// derive from it (C-3). A null converter means the value is a plain count, already an integer.
const fieldUnits = {
  usd: { humanSuffix: 'Usd', integerSuffix: 'Cents', convert: usdToCents },
  percent: { humanSuffix: 'Percent', integerSuffix: 'Bp', convert: percentToBp },
  multiplier: { humanSuffix: 'Multiplier', integerSuffix: 'MultiplierBp', convert: multiplierToBp },
  exponent: { humanSuffix: 'Exponent', integerSuffix: 'ExponentBp', convert: multiplierToBp },
  hypeIndex: { humanSuffix: 'Index', integerSuffix: 'Bp', convert: hypeIndexToBp },
  alignmentPoints: {
    humanSuffix: 'Points',
    integerSuffix: 'Milli',
    convert: alignmentPointsToMilli,
  },
  milli: { humanSuffix: '', integerSuffix: 'Milli', convert: toMilli },
  realSeconds: { humanSuffix: 'Seconds', integerSuffix: 'RealMs', convert: secondsToRealMs },
  gameSeconds: { humanSuffix: 'GameSeconds', integerSuffix: 'GameMs', convert: secondsToGameMs },
  days: { humanSuffix: 'Days', integerSuffix: 'GameMs', convert: daysToGameMs },
  activeMinutes: {
    humanSuffix: 'ActiveMinutes',
    integerSuffix: 'GameMs',
    convert: activeMinutesToGameMs,
  },
  count: { humanSuffix: '', integerSuffix: '', convert: null },
} as const satisfies Readonly<Record<string, FieldUnit>>;

type FieldUnits = typeof fieldUnits;
export type UnitName = keyof FieldUnits;

export interface RangeSpec<Unit extends UnitName = UnitName> {
  readonly range: Unit;
}

type FieldSpec = UnitName | RangeSpec;
export type FieldTable = Readonly<Record<string, FieldSpec>>;

export interface IntegerRange {
  readonly min: number;
  readonly max: number;
}

type UnitOf<Spec extends FieldSpec> = Spec extends RangeSpec<infer Unit> ? Unit : Spec;
type CompiledKey<
  Name extends string,
  Spec extends FieldSpec,
> = `${Name}${FieldUnits[UnitOf<Spec>]['integerSuffix']}`;
type CompiledValue<Spec extends FieldSpec> = Spec extends UnitName ? number : IntegerRange;

export type CompiledFields<Table extends FieldTable> = {
  readonly [Name in keyof Table & string as CompiledKey<Name, Table[Name]>]: CompiledValue<
    Table[Name]
  >;
};

export const range = <Unit extends UnitName>(unit: Unit): RangeSpec<Unit> => ({ range: unit });

function defineValueSchema(unit: FieldUnit): z.ZodType<number> {
  const { convert } = unit;
  if (convert === null) {
    return z.int({ error: 'must be a whole number' }).transform(withoutNegativeZero);
  }
  return z.number().transform((value, context) => {
    const conversion = convert(value);
    if (conversion.ok) return conversion.value;
    context.addIssue({ code: 'custom', message: conversion.error.reason, input: value });
    return z.NEVER;
  });
}

function defineFieldSchema(spec: FieldSpec): z.ZodType {
  if (typeof spec === 'string') return defineValueSchema(fieldUnits[spec]);
  const value = defineValueSchema(fieldUnits[spec.range]);
  return z
    .strictObject({ min: value, max: value })
    .refine((bounds) => bounds.min <= bounds.max, { message: 'min must not exceed max' });
}

export function defineFieldGroup<const Table extends FieldTable>(
  table: Table,
): z.ZodType<CompiledFields<Table>> {
  const fields = Object.entries(table).map(([name, spec]) => {
    const unit = fieldUnits[typeof spec === 'string' ? spec : spec.range];
    return {
      humanKey: `${name}${unit.humanSuffix}`,
      compiledKey: `${name}${unit.integerSuffix}`,
      schema: defineFieldSchema(spec),
    };
  });
  const authored = z.strictObject(
    Object.fromEntries(fields.map((field) => [field.humanKey, field.schema])),
  );
  return authored.transform(
    (values) =>
      Object.fromEntries(
        fields.map((field) => [field.compiledKey, values[field.humanKey]]),
      ) as CompiledFields<Table>,
  );
}
