import { parseDocument } from 'yaml';
import type * as z from 'zod';

import { computeContentPackVersion, stripAuthoringMetadata } from '../../src/core';
import type { ContentKind } from '../../src/core/contentSchema';
import { err, ok, type Result } from '../../src/shared';

export interface ContentSource {
  readonly path: string;
  readonly text: string;
}

export interface ContentError {
  readonly path: string;
  readonly field: string;
  readonly reason: string;
}

export interface CompiledContent {
  readonly pack: Readonly<Record<string, unknown>>;
  readonly contentPackVersion: string;
}

interface CompiledItem {
  readonly kind: ContentKind;
  readonly item: unknown;
}

type ItemResult = Result<CompiledItem, readonly ContentError[]>;

const contentRoot = 'content/';

export const formatContentError = ({ path, field, reason }: ContentError): string =>
  field === '' ? `${path}: ${reason}` : `${path}: ${field}: ${reason}`;

// yaml's pretty message starts with "<reason> at line L, column C:" followed by a code frame.
const firstLine = (message: string): string => (message.split('\n')[0] ?? '').replace(/:$/, '');

function toSchemaErrors(path: string, issues: readonly z.core.$ZodIssue[]): ContentError[] {
  return issues.flatMap((issue) => {
    const field = issue.path.map(String).join('.');
    if (issue.code !== 'unrecognized_keys') return [{ path, field, reason: issue.message }];
    return issue.keys.map((key) => ({
      path,
      field: field === '' ? key : `${field}.${key}`,
      reason: 'is not a known field',
    }));
  });
}

function compileSource(source: ContentSource, kinds: readonly ContentKind[]): ItemResult {
  const { path } = source;
  const kind = kinds.find((candidate) => candidate.matches(path));
  if (kind === undefined)
    return err([{ path, field: '', reason: 'no content kind for this path' }]);
  // uniqueKeys: a duplicated key would otherwise silently drop one of the two values.
  const document = parseDocument(source.text, { uniqueKeys: true });
  if (document.errors.length > 0) {
    return err(
      document.errors.map((error) => ({ path, field: '', reason: firstLine(error.message) })),
    );
  }
  // toJS throws (rather than recording an error) for an unresolved alias.
  let data: unknown;
  try {
    data = document.toJS();
  } catch (error) {
    return err([{ path, field: '', reason: firstLine(String(error)) }]);
  }
  const parsed = kind.schema.safeParse(data);
  if (!parsed.success) return err(toSchemaErrors(path, parsed.error.issues));
  return ok({ kind, item: stripAuthoringMetadata(parsed.data) });
}

function assembleKind(kind: ContentKind, items: readonly unknown[]): Result<unknown, ContentError> {
  if (kind.cardinality === 'many') return ok(items);
  if (items.length === 1) return ok(items[0]);
  const reason = `needs exactly one file for the ${kind.name} kind, found ${String(items.length)}`;
  return err({ path: contentRoot, field: '', reason });
}

function assemblePack(
  compiled: readonly CompiledItem[],
  kinds: readonly ContentKind[],
): Result<Readonly<Record<string, unknown>>, readonly ContentError[]> {
  const entries: [string, unknown][] = [];
  const errors: ContentError[] = [];
  for (const kind of kinds) {
    const items = compiled.filter((entry) => entry.kind === kind).map((entry) => entry.item);
    const assembled = assembleKind(kind, items);
    if (assembled.ok) entries.push([kind.name, assembled.value]);
    else errors.push(assembled.error);
  }
  return errors.length > 0 ? err(errors) : ok(Object.fromEntries(entries));
}

// Pure: sources in, pack out, so tests need no filesystem. Every error is collected, not
// only the first, so an author fixes a file in one pass.
export function compileContentPack(
  sources: readonly ContentSource[],
  kinds: readonly ContentKind[],
): Result<CompiledContent, readonly ContentError[]> {
  const ordered = [...sources].sort((a, b) => (a.path < b.path ? -1 : 1));
  const results = ordered.map((source) => compileSource(source, kinds));
  const errors = results.flatMap((result) => (result.ok ? [] : result.error));
  if (errors.length > 0) return err(errors);
  const assembled = assemblePack(
    results.flatMap((result) => (result.ok ? [result.value] : [])),
    kinds,
  );
  if (!assembled.ok) return assembled;
  return ok({
    pack: assembled.value,
    contentPackVersion: computeContentPackVersion(assembled.value),
  });
}
