import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { findMissingTranslations, formatTranslationWarning } from './findMissingTranslations.ts';

const runFile = promisify(execFile);
const cliPath = path.join(import.meta.dirname, 'listMissingTranslations.ts');

const englishCatalog = {
  'inbox.unreadCount': '{count, plural, one {# message} other {# messages}}',
  'time.day': 'Day {day, number}',
};

let rootDir = '';

const writeLocaleFile = async (relativePath: string, text: string): Promise<void> => {
  const target = path.join(rootDir, 'locales', relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, text);
};

const runCli = async (): Promise<{ code: number; stdout: string; stderr: string }> => {
  try {
    const { stdout, stderr } = await runFile(process.execPath, [cliPath, rootDir], {
      env: { ...process.env, GITHUB_ACTIONS: 'true' },
    });
    return { code: 0, stdout, stderr };
  } catch (error) {
    const failed = error as { code: number; stdout: string; stderr: string };
    return { code: failed.code, stdout: failed.stdout, stderr: failed.stderr };
  }
};

beforeEach(async () => {
  rootDir = await mkdtemp(path.join(tmpdir(), 'hitl-i18n-'));
  await writeLocaleFile('en/ui.json', JSON.stringify(englishCatalog));
});

afterEach(async () => {
  await rm(rootDir, { recursive: true, force: true });
});

describe('findMissingTranslations', () => {
  it('reports nothing when English is the only locale', async () => {
    expect(await findMissingTranslations(rootDir, new Set(['event.a.body']))).toEqual({
      warnings: [],
      errors: [],
    });
  });

  it('warns about missing and unknown UI keys in a translation', async () => {
    await writeLocaleFile(
      'fr/ui.json',
      JSON.stringify({ 'time.day': 'Jour {day, number}', 'old.key': 'x' }),
    );

    expect(await findMissingTranslations(rootDir, new Set())).toEqual({
      warnings: [
        { file: 'locales/fr/ui.json', message: 'missing translation inbox.unreadCount' },
        { file: 'locales/fr/ui.json', message: 'unknown key old.key' },
      ],
      errors: [],
    });
  });

  it('warns about every key when a locale has no ui.json yet', async () => {
    await writeLocaleFile('fr/content/events.yaml', '{}');

    const { warnings } = await findMissingTranslations(rootDir, new Set());

    expect(warnings.map((warning) => warning.message)).toEqual([
      'missing translation inbox.unreadCount',
      'missing translation time.day',
    ]);
  });

  it('compares content catalogs with the English content keys', async () => {
    await writeLocaleFile('fr/ui.json', JSON.stringify(englishCatalog));
    await writeLocaleFile('fr/content/events.yaml', "event.a.body: 'Corps'\nevent.z.body: 'Z'\n");

    expect(
      await findMissingTranslations(rootDir, new Set(['event.a.body', 'event.b.body'])),
    ).toEqual({
      warnings: [
        { file: 'locales/fr/content', message: 'missing translation event.b.body' },
        { file: 'locales/fr/content', message: 'unknown key event.z.body' },
      ],
      errors: [],
    });
  });

  it('lets a translation drop an argument but not add or retype one', async () => {
    await writeLocaleFile(
      'fr/ui.json',
      JSON.stringify({
        'inbox.unreadCount': '{count, plural, one {Un message} other {Des messages}}',
        'time.day': 'Jour {day, number} ({extra})',
      }),
    );

    expect(await findMissingTranslations(rootDir, new Set())).toEqual({
      warnings: [],
      errors: ['locales/fr/ui.json: time.day: argument "extra" is not in the English message'],
    });

    await writeLocaleFile('fr/ui.json', JSON.stringify({ 'time.day': 'Jour {day}' }));

    expect((await findMissingTranslations(rootDir, new Set())).errors).toEqual([
      'locales/fr/ui.json: time.day: argument "day" is string, English has number',
    ]);
  });

  it('treats an empty content file as a locale that translates nothing', async () => {
    await writeLocaleFile('fr/content/events.yaml', '# nothing yet\n');

    expect((await findMissingTranslations(rootDir, new Set())).errors).toEqual([]);
  });

  it('escapes newlines and separators in GitHub annotations', () => {
    expect(formatTranslationWarning({ file: 'a:b,c', message: 'unknown key x\ny%' }, true)).toBe(
      '::warning file=a%3Ab%2Cc::unknown key x%0Ay%25',
    );
  });

  it.each([
    ['fr/ui.json', '{ "time.day": ', /^locales\/fr\/ui\.json: invalid JSON/],
    [
      'fr/ui.json',
      '{ "time.day": 3 }',
      /^locales\/fr\/ui\.json: time\.day: value must be a string/,
    ],
    [
      'fr/ui.json',
      '{ "time.day": "Jour {day" }',
      /^locales\/fr\/ui\.json: time\.day: ICU syntax error/,
    ],
    [
      'fr/content/events.yaml',
      'event.a.body: [1, 2]\n',
      /^locales\/fr\/content\/events\.yaml: must be a flat map/,
    ],
    ['fr/content/events.yaml', 'a: b\na: c\n', /^locales\/fr\/content\/events\.yaml: invalid YAML/],
  ])('reports a malformed %s as an error', async (file, text, error) => {
    await writeLocaleFile(file, text);

    const report = await findMissingTranslations(rootDir, new Set());

    expect(report.errors).toEqual([expect.stringMatching(error)]);
  });

  it('formats warnings as GitHub annotations in CI and as plain lines elsewhere', () => {
    const warning = { file: 'locales/fr/ui.json', message: 'missing translation time.day' };

    expect(formatTranslationWarning(warning, true)).toBe(
      '::warning file=locales/fr/ui.json::missing translation time.day',
    );
    expect(formatTranslationWarning(warning, false)).toBe(
      'warning locales/fr/ui.json: missing translation time.day',
    );
  });
});

describe('listMissingTranslations', () => {
  it('prints nothing and exits 0 with no translations', async () => {
    expect(await runCli()).toEqual({ code: 0, stdout: '', stderr: '' });
  });

  it('exits 0 for missing keys, printing one warning per key', async () => {
    await writeLocaleFile('fr/ui.json', '{}');

    const result = await runCli();

    expect(result.code).toBe(0);
    expect(result.stdout).toBe(
      '::warning file=locales/fr/ui.json::missing translation inbox.unreadCount\n' +
        '::warning file=locales/fr/ui.json::missing translation time.day\n',
    );
  });

  it('exits non-zero for a malformed catalog', async () => {
    await writeLocaleFile('fr/ui.json', 'not json');

    const result = await runCli();

    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain('locales/fr/ui.json: invalid JSON');
  });
});
