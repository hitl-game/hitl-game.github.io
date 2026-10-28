import { parse } from 'yaml';

import type { ContentPack } from '../../src/core';
import { tuningSchema } from '../../src/core/contentSchema';
import tuningText from '../../content/tuning.yaml?raw';
import { deepFreeze } from './deepFreeze';

export const tuningSourcePath = 'content/tuning.yaml';

// Dotted paths in authoring units: { 'phases.garage.baseCostsPerDayUsd': 400 }.
export type TuningOverrides = Readonly<Record<string, unknown>>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function setPath(target: Record<string, unknown>, dottedPath: string, value: unknown): void {
  const keys = dottedPath.split('.');
  const last = keys.pop() ?? dottedPath;
  const parent = keys.reduce<Record<string, unknown>>((node, key) => {
    const child = node[key];
    if (!isRecord(child)) throw new Error(`No tuning group at ${dottedPath}`);
    return child;
  }, target);
  parent[last] = value;
}

export const readTuningSource = (): string => tuningText;

// The real content/tuning.yaml as authored (human units), with optional overrides.
export function makeTuningInput(overrides: TuningOverrides = {}): Record<string, unknown> {
  const input: unknown = parse(readTuningSource());
  if (!isRecord(input)) throw new Error(`${tuningSourcePath} is not a mapping`);
  for (const [dottedPath, value] of Object.entries(overrides)) setPath(input, dottedPath, value);
  return input;
}

// A pack compiled by the real tuning schema from the real file; never a hand-written literal.
export const makeContentPack = (overrides: TuningOverrides = {}): ContentPack =>
  deepFreeze({ tuning: tuningSchema.parse(makeTuningInput(overrides)) });
