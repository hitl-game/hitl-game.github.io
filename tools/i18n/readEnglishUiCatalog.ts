import { readFile } from 'node:fs/promises';
import path from 'node:path';

import { parseUiCatalog, type ParsedUiCatalog } from './parseUiCatalog.ts';

export const englishUiCatalogPath = 'locales/en/ui.json';

export const readEnglishUiCatalog = async (rootDir: string): Promise<ParsedUiCatalog> =>
  parseUiCatalog(await readFile(path.join(rootDir, englishUiCatalogPath), 'utf8'));
