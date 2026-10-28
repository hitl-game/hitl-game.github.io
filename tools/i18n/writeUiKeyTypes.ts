import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import { generateUiKeyTypes, uiKeyTypesPath } from './generateUiKeyTypes.ts';
import { englishUiCatalogPath, readEnglishUiCatalog } from './readEnglishUiCatalog.ts';

const rootDir = path.join(import.meta.dirname, '..', '..');

const catalog = await readEnglishUiCatalog(rootDir);
const generated = catalog.ok
  ? await generateUiKeyTypes(catalog.catalog, rootDir)
  : { ok: false as const, problems: catalog.problems };

if (generated.ok) {
  await writeFile(path.join(rootDir, uiKeyTypesPath), generated.text);
  process.stdout.write(`Wrote ${uiKeyTypesPath}\n`);
} else {
  process.stderr.write(
    `${englishUiCatalogPath} is invalid:\n${generated.problems.map((problem) => `  ${problem}`).join('\n')}\n`,
  );
  process.exitCode = 1;
}
