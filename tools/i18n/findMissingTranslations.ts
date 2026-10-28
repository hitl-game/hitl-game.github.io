import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'yaml';

import { collectMessageArguments } from './collectMessageArguments.ts';
import { parseUiCatalog, type UiCatalog } from './parseUiCatalog.ts';
import { englishUiCatalogPath, readEnglishUiCatalog } from './readEnglishUiCatalog.ts';

export interface TranslationWarning {
  readonly file: string;
  readonly message: string;
}

// Missing translations are warnings (English is the fallback); a malformed catalog is an error.
export interface TranslationReport {
  readonly warnings: readonly TranslationWarning[];
  readonly errors: readonly string[];
}

const localesDir = 'locales';
const sourceLocale = 'en';

const isMissingPath = (error: unknown): boolean =>
  error instanceof Error && 'code' in error && error.code === 'ENOENT';

// A locale without a ui.json or a content folder is valid: it simply translates nothing yet.
async function readOptional<T>(read: () => Promise<T>, missing: T): Promise<T> {
  try {
    return await read();
  } catch (error) {
    if (isMissingPath(error)) return missing;
    throw error;
  }
}

const listDirectories = async (dir: string): Promise<string[]> => {
  const entries = await readOptional(() => readdir(dir, { withFileTypes: true }), []);
  return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
};

function compareKeys(
  file: string,
  englishKeys: ReadonlySet<string>,
  translatedKeys: ReadonlySet<string>,
): TranslationWarning[] {
  const missing = [...englishKeys].filter((key) => !translatedKeys.has(key));
  const unknown = [...translatedKeys].filter((key) => !englishKeys.has(key));
  return [
    ...missing.map((key) => ({ file, message: `missing translation ${key}` })),
    ...unknown.map((key) => ({ file, message: `unknown key ${key}` })),
  ];
}

const argumentTypesOf = (message: string): ReadonlyMap<string, string> => {
  const parsed = collectMessageArguments(message);
  return parsed.ok ? parsed.argumentTypes : new Map();
};

// `t()` passes the English argument set, so a translation may drop an argument (extra values
// are ignored) but must not need one English lacks, nor read one as another type: either throws.
function compareArguments(english: UiCatalog, translated: UiCatalog): string[] {
  return Object.entries(translated).flatMap(([key, message]) => {
    const englishMessage = english[key];
    if (englishMessage === undefined) return [];
    const allowed = argumentTypesOf(englishMessage);
    return [...argumentTypesOf(message)].flatMap(([name, type]) => {
      const expected = allowed.get(name);
      if (expected === undefined)
        return [`${key}: argument "${name}" is not in the English message`];
      return expected === type
        ? []
        : [`${key}: argument "${name}" is ${type}, English has ${expected}`];
    });
  });
}

async function checkUiCatalog(
  rootDir: string,
  locale: string,
  english: UiCatalog,
): Promise<TranslationReport> {
  const englishKeys = new Set(Object.keys(english));
  const file = `${localesDir}/${locale}/ui.json`;
  const text = await readOptional(() => readFile(path.join(rootDir, file), 'utf8'), undefined);
  if (text === undefined)
    return { warnings: compareKeys(file, englishKeys, new Set()), errors: [] };
  const parsed = parseUiCatalog(text);
  if (!parsed.ok) {
    return { warnings: [], errors: parsed.problems.map((problem) => `${file}: ${problem}`) };
  }
  return {
    warnings: compareKeys(file, englishKeys, new Set(Object.keys(parsed.catalog))),
    errors: compareArguments(english, parsed.catalog).map((problem) => `${file}: ${problem}`),
  };
}

const isStringMap = (value: unknown): value is Readonly<Record<string, string>> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');

async function readContentKeys(rootDir: string, file: string): Promise<string[] | string> {
  try {
    // An empty or comment-only file parses to null: a locale that translates nothing yet.
    const parsed: unknown = parse(await readFile(path.join(rootDir, file), 'utf8')) ?? {};
    return isStringMap(parsed)
      ? Object.keys(parsed)
      : `${file}: must be a flat map of "<contentId>.<field path>" to text`;
  } catch (error) {
    return `${file}: invalid YAML: ${error instanceof Error ? error.message : String(error)}`;
  }
}

async function checkContentCatalogs(
  rootDir: string,
  locale: string,
  englishKeys: ReadonlySet<string>,
): Promise<TranslationReport> {
  const dir = `${localesDir}/${locale}/content`;
  const names = await readOptional(() => readdir(path.join(rootDir, dir)), []);
  const files = names.filter((name) => name.endsWith('.yaml')).map((name) => `${dir}/${name}`);
  const results = await Promise.all(files.map((file) => readContentKeys(rootDir, file)));
  const errors = results.filter((result) => typeof result === 'string');
  const keys = results.filter((result) => typeof result !== 'string').flat();
  return { warnings: compareKeys(dir, englishKeys, new Set(keys)), errors };
}

const mergeReports = (reports: readonly TranslationReport[]): TranslationReport => ({
  warnings: reports.flatMap((report) => report.warnings),
  errors: reports.flatMap((report) => report.errors),
});

export async function findMissingTranslations(
  rootDir: string,
  englishContentKeys: ReadonlySet<string>,
): Promise<TranslationReport> {
  const english = await readEnglishUiCatalog(rootDir);
  if (!english.ok) {
    return { warnings: [], errors: english.problems.map((p) => `${englishUiCatalogPath}: ${p}`) };
  }
  const locales = (await listDirectories(path.join(rootDir, localesDir)))
    .filter((locale) => locale !== sourceLocale)
    .sort();
  const reports = await Promise.all(
    locales.flatMap((locale) => [
      checkUiCatalog(rootDir, locale, english.catalog),
      checkContentCatalogs(rootDir, locale, englishContentKeys),
    ]),
  );
  return mergeReports(reports);
}

// Workflow commands end at a newline, so keys and paths from translator files are escaped.
const escapeData = (text: string): string =>
  text.replaceAll('%', '%25').replaceAll('\r', '%0D').replaceAll('\n', '%0A');
const escapeProperty = (text: string): string =>
  escapeData(text).replaceAll(':', '%3A').replaceAll(',', '%2C');

// GitHub Actions turns `::warning file=…::` lines into annotations on the pull request.
export const formatTranslationWarning = (
  warning: TranslationWarning,
  isGithubActions: boolean,
): string =>
  isGithubActions
    ? `::warning file=${escapeProperty(warning.file)}::${escapeData(warning.message)}`
    : `warning ${warning.file}: ${warning.message}`;
