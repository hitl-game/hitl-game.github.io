import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { generateUiKeyTypes, uiKeyTypesPath } from './generateUiKeyTypes.ts';
import { readEnglishUiCatalog } from './readEnglishUiCatalog.ts';

const rootDir = path.join(import.meta.dirname, '..', '..');

const readCatalog = async (): Promise<Readonly<Record<string, string>>> => {
  const parsed = await readEnglishUiCatalog(rootDir);
  if (!parsed.ok) throw new Error(parsed.problems.join('\n'));
  return parsed.catalog;
};

describe('generateUiKeyTypes', () => {
  it(`matches the committed ${uiKeyTypesPath} (run npm run i18n:types)`, async () => {
    const generated = await generateUiKeyTypes(await readCatalog(), rootDir);

    expect(generated.ok && generated.text).toBe(
      await readFile(path.join(rootDir, uiKeyTypesPath), 'utf8'),
    );
  });

  it('types argument-less messages as undefined and sorts keys', async () => {
    const generated = await generateUiKeyTypes(
      { 'zone.title': 'Zone', 'area.count': '{count, plural, other {#}}' },
      rootDir,
    );

    expect(generated.ok && generated.text).toContain(
      "readonly 'area.count': { readonly count: number };\n  readonly 'zone.title': undefined;",
    );
  });

  it('fails with the key and the reason when a message is ambiguous', async () => {
    expect(await generateUiKeyTypes({ 'area.mixed': '{n} {n, number}' }, rootDir)).toEqual({
      ok: false,
      problems: ['area.mixed: argument "n" is used as both string and number'],
    });
  });
});

describe('locales/en/ui.json', () => {
  it('never names hidden state in a key or a message (UX-DR50)', async () => {
    const hiddenState = /alignment|infection|titleStage/i;
    const leaks = Object.entries(await readCatalog()).filter(
      ([key, message]) => hiddenState.test(key) || hiddenState.test(message),
    );

    expect(leaks).toEqual([]);
  });
});
