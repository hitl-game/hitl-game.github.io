import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { findInitialChunks, matchesSizeLimitGlob } from './findInitialChunks.ts';

// Lazy-only code that must never reach the files index.html loads (architecture D14).
const lazyOnlyMarkers = [{ name: 'PDFKit', marker: 'PDFKit' }];

interface SizeLimitEntry {
  readonly name: string;
  readonly path: readonly string[];
}

const rootDir = path.join(import.meta.dirname, '..');
const distDir = path.join(rootDir, 'dist');
const readAsset = (assetPath: string): Promise<string> =>
  readFile(path.join(distDir, assetPath), 'utf8');

const readInitialBudgetGlobs = async (): Promise<readonly string[]> => {
  const entries = JSON.parse(
    await readFile(path.join(rootDir, '.size-limit.json'), 'utf8'),
  ) as SizeLimitEntry[];
  return entries.find((entry) => entry.name === 'initial bundle')?.path ?? [];
};

const findProblems = async (initialChunks: readonly string[]): Promise<string[]> => {
  const budgetGlobs = await readInitialBudgetGlobs();
  const problems = await Promise.all(
    initialChunks.map(async (assetPath) => {
      const code = await readAsset(assetPath);
      const leaks = lazyOnlyMarkers
        .filter(({ marker }) => code.includes(marker))
        .map(({ name }) => `${assetPath}: contains ${name}, which must stay a lazy chunk`);
      const isBudgeted = budgetGlobs.some((glob) => matchesSizeLimitGlob(assetPath, glob));
      return isBudgeted
        ? leaks
        : [
            ...leaks,
            `${assetPath}: loaded by index.html but not counted by the initial bundle budget in .size-limit.json`,
          ];
    }),
  );
  return problems.flat();
};

const initialChunks = await findInitialChunks(await readAsset('index.html'), readAsset);
const problems = await findProblems(initialChunks);

if (problems.length > 0) {
  process.stderr.write(
    `Initial bundle check failed:\n${problems.map((p) => `  ${p}`).join('\n')}\n`,
  );
  process.exitCode = 1;
} else {
  process.stdout.write(
    `Initial bundle check: ${String(initialChunks.length)} files, all budgeted, no lazy-only code.\n`,
  );
}
