import path from 'node:path';

import { findMissingTranslations, formatTranslationWarning } from './findMissingTranslations.ts';

// Usage: node tools/i18n/listMissingTranslations.ts [rootDir]. The root defaults to the repo.
const rootDir = process.argv[2] ?? path.join(import.meta.dirname, '..', '..');

// No content kind carries translatable text yet; Story 7.1 derives these keys from the content
// pack, and missing content translations are listed from then on.
const englishContentKeys = new Set<string>();

const report = await findMissingTranslations(rootDir, englishContentKeys);
const isGithubActions = process.env['GITHUB_ACTIONS'] === 'true';

for (const warning of report.warnings) {
  process.stdout.write(`${formatTranslationWarning(warning, isGithubActions)}\n`);
}
if (report.errors.length > 0) {
  process.stderr.write(
    `Malformed translation catalogs:\n${report.errors.map((error) => `  ${error}`).join('\n')}\n`,
  );
  process.exitCode = 1;
}
