import * as fc from 'fast-check';
import { stringify } from 'yaml';
import { describe, expect, it } from 'vitest';
import * as z from 'zod';

import { contentKinds, type ContentKind } from '../../src/core/contentSchema';
import {
  makeContentPack,
  makeTuningInput,
  readTuningSource,
  tuningSourcePath,
} from '../../tests/builders';
import {
  compileContentPack,
  formatContentError,
  type CompiledContent,
  type ContentError,
  type ContentSource,
} from './compileContentPack';

// A test-only kind shaped like a Story 7.1 event: it carries the authoring metadata and a
// nested `status` that is shipped data (the AllGreen status in a decision block).
const eventKind: ContentKind = {
  name: 'events',
  matches: (path) => path.startsWith('content/events/'),
  schema: z.strictObject({
    id: z.string(),
    kernel: z.string(),
    status: z.enum(['placeholder', 'final']),
    translatorNote: z.string().optional(),
    weight: z.int(),
    decision: z.strictObject({ status: z.string() }),
  }),
  cardinality: 'many',
};

const kinds = [...contentKinds, eventKind];
const tuningSource: ContentSource = { path: tuningSourcePath, text: readTuningSource() };

const eventSource = (path: string, fields: Readonly<Record<string, unknown>>): ContentSource => ({
  path,
  text: stringify({
    id: 'event.seed.gpu-shortage',
    kernel: 'Every startup learns GPU quotas the hard way.',
    status: 'placeholder',
    weight: 3,
    decision: { status: 'degraded' },
    ...fields,
  }),
});

const compile = (sources: readonly ContentSource[]): CompiledContent => {
  const result = compileContentPack(sources, kinds);
  if (!result.ok) throw new Error(result.error.map(formatContentError).join('\n'));
  return result.value;
};

const errorsOf = (sources: readonly ContentSource[]): readonly ContentError[] => {
  const result = compileContentPack(sources, kinds);
  return result.ok ? [] : result.error;
};

const tuningSourceFrom = (input: unknown): ContentSource => ({
  path: tuningSourcePath,
  text: stringify(input),
});

const leafPathsOf = (value: unknown, prefix: readonly string[] = []): string[][] =>
  typeof value === 'object' && value !== null
    ? Object.entries(value).flatMap(([key, child]) => leafPathsOf(child, [...prefix, key]))
    : [[...prefix]];

describe('compileContentPack', () => {
  it('compiles the real tuning file into the same pack the tuning schema builds', () => {
    const { pack, contentPackVersion } = compile([tuningSource]);

    expect(pack).toEqual({ ...makeContentPack(), events: [] });
    expect(contentPackVersion).toMatch(/^[0-9a-f]{64}$/);
  });

  it('strips kernel, translatorNote and status from the top level only', () => {
    const { pack } = compile([
      tuningSource,
      eventSource('content/events/seed/gpu-shortage.yaml', { translatorNote: 'pun on quota' }),
    ]);

    expect(pack['events']).toEqual([
      { id: 'event.seed.gpu-shortage', weight: 3, decision: { status: 'degraded' } },
    ]);
  });

  it('keeps contentPackVersion when only kernel, translatorNote and status change', () => {
    const path = 'content/events/seed/gpu-shortage.yaml';
    const draft = compile([tuningSource, eventSource(path, {})]);
    const final = compile([
      tuningSource,
      eventSource(path, { kernel: 'A different kernel.', status: 'final', translatorNote: 'n/a' }),
    ]);

    expect(JSON.stringify(final.pack)).toBe(JSON.stringify(draft.pack));
    expect(final.contentPackVersion).toBe(draft.contentPackVersion);
  });

  it('changes contentPackVersion when a nested shipped status changes', () => {
    const path = 'content/events/seed/gpu-shortage.yaml';
    const before = compile([tuningSource, eventSource(path, {})]);
    const after = compile([tuningSource, eventSource(path, { decision: { status: 'ok' } })]);

    expect(after.contentPackVersion).not.toBe(before.contentPackVersion);
  });

  it('changes contentPackVersion when any shipped tuning value changes', () => {
    const baseline = compile([tuningSource]).contentPackVersion;
    const leafPaths = leafPathsOf(makeTuningInput());
    fc.assert(
      fc.property(fc.constantFrom(...leafPaths), (leafPath) => {
        const dottedPath = leafPath.join('.');
        const current = leafPath.reduce<unknown>(
          (node, key) => (node as Record<string, unknown>)[key],
          makeTuningInput(),
        );
        // Lowering a range's min (or raising anything else) keeps min <= max valid.
        const changed = Number(current) + (leafPath.at(-1) === 'min' ? -1 : 1);
        const input = makeTuningInput({ [dottedPath]: changed });

        expect(compile([tuningSourceFrom(input)]).contentPackVersion).not.toBe(baseline);
      }),
    );
  });

  it('ignores YAML key order, comments and whitespace', () => {
    const input = makeTuningInput();
    const reordered = Object.fromEntries(Object.entries(input).reverse());
    const text = `# a comment\n\n${stringify(reordered, { indent: 4 })}\n\n# trailing\n`;

    expect(compile([{ path: tuningSourcePath, text }]).contentPackVersion).toBe(
      compile([tuningSource]).contentPackVersion,
    );
  });

  it('collects every error with file, field and reason', () => {
    const input = makeTuningInput({
      'phases.garage.baseCostsPerDayUsd': 0.001,
      'start.hypeIndex': 'high',
    });

    expect(errorsOf([tuningSourceFrom(input)]).map(formatContentError)).toEqual([
      'content/tuning.yaml: start.hypeIndex: Invalid input: expected number, received string',
      'content/tuning.yaml: phases.garage.baseCostsPerDayUsd: 0.001 is not a whole number of cents',
    ]);
  });

  it('names each unknown key as its own field', () => {
    const input = makeTuningInput({ 'spine.cooldownDays': 5, 'spine.gapDays': 3 });

    expect(errorsOf([tuningSourceFrom(input)]).map(formatContentError)).toEqual([
      'content/tuning.yaml: spine.cooldownDays: is not a known field',
      'content/tuning.yaml: spine.gapDays: is not a known field',
    ]);
  });

  it('rejects a duplicated YAML key, which would silently drop a value', () => {
    const text = `${readTuningSource()}\nmeta:\n  aegisVersionOffset: 4\n`;
    const [error] = errorsOf([{ path: tuningSourcePath, text }]);

    expect(error?.path).toBe(tuningSourcePath);
    expect(error?.reason).toMatch(/^Map keys must be unique at line \d+, column \d+$/);
  });

  it('reports an unresolved YAML alias instead of throwing', () => {
    const [error] = errorsOf([{ path: tuningSourcePath, text: 'start: *missing\n' }]);

    expect(error?.path).toBe(tuningSourcePath);
    expect(error?.reason).toMatch(/Unresolved alias/);
  });

  it('reports a YAML syntax error with its line', () => {
    const [error] = errorsOf([{ path: tuningSourcePath, text: 'start: [unclosed\n' }]);

    expect(error?.reason).toMatch(/line \d+, column \d+/);
  });

  it('rejects a file that no content kind claims', () => {
    expect(errorsOf([tuningSource, { path: 'content/tuning-old.yaml', text: 'a: 1\n' }])).toEqual([
      { path: 'content/tuning-old.yaml', field: '', reason: 'no content kind for this path' },
    ]);
  });

  it('rejects a pack without its single tuning file', () => {
    expect(errorsOf([]).map(formatContentError)).toEqual([
      'content/: needs exactly one file for the tuning kind, found 0',
    ]);
  });

  it('collects a many kind in path order whatever the source order', () => {
    const first = eventSource('content/events/garage/a.yaml', { id: 'event.garage.a' });
    const second = eventSource('content/events/seed/b.yaml', { id: 'event.seed.b' });
    const forward = compile([tuningSource, first, second]);
    const backward = compile([second, first, tuningSource]);

    expect(backward.pack).toEqual(forward.pack);
    expect(backward.contentPackVersion).toBe(forward.contentPackVersion);
  });
});
