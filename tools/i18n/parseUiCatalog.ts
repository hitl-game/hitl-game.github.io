import { collectMessageArguments } from './collectMessageArguments.ts';

export type UiCatalog = Readonly<Record<string, string>>;

export type ParsedUiCatalog =
  | { readonly ok: true; readonly catalog: UiCatalog }
  | { readonly ok: false; readonly problems: readonly string[] };

// Architecture naming: `area.camelCase`, at least two segments.
const keyPattern = /^[a-z][a-zA-Z0-9]*(?:\.[a-z][a-zA-Z0-9]*)+$/;
const jsonStringPattern = /"(?:[^"\\]|\\.)*"/g;

const isRecord = (value: unknown): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseJson = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
};

// JSON.parse keeps the last of two equal keys, which would silently drop a translation. In a
// flat object of strings the string tokens alternate key, value, so every even token is a key.
function findDuplicateKeys(text: string): string[] {
  const keys = [...text.matchAll(jsonStringPattern)]
    .filter((_, index) => index % 2 === 0)
    .map((match) => JSON.parse(match[0]) as string);
  return [...new Set(keys.filter((key, index) => keys.indexOf(key) !== index))];
}

const checkEntry = ([key, message]: [string, unknown]): string[] => {
  if (typeof message !== 'string') return [`${key}: value must be a string`];
  const keyProblems = keyPattern.test(key) ? [] : [`${key}: key must look like area.camelCase`];
  const parsed = collectMessageArguments(message);
  return parsed.ok
    ? keyProblems
    : [...keyProblems, ...parsed.problems.map((problem) => `${key}: ${problem}`)];
};

export function parseUiCatalog(text: string): ParsedUiCatalog {
  const parsed = parseJson(text);
  if (parsed instanceof Error) return { ok: false, problems: [`invalid JSON: ${parsed.message}`] };
  if (!isRecord(parsed)) return { ok: false, problems: ['the catalog must be a flat JSON object'] };
  const problems = Object.entries(parsed).flatMap(checkEntry);
  if (problems.length > 0) return { ok: false, problems };
  const duplicates = findDuplicateKeys(text);
  if (duplicates.length > 0) {
    return { ok: false, problems: duplicates.map((key) => `${key}: duplicate key`) };
  }
  return { ok: true, catalog: parsed as UiCatalog };
}
