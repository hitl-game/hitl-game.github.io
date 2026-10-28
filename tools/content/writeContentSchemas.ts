import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { runnerImport } from 'vite';

import type * as contentSchema from '../../src/core/contentSchema';
import type * as generator from './generateContentSchema';

// Node cannot run src/core directly (extensionless imports), so Vite's module runner loads
// it; no extra dependency such as tsx is needed.
const rootDir = path.join(import.meta.dirname, '..', '..');
const inlineConfig = { root: rootDir, configFile: false as const, logLevel: 'error' as const };

const { module: schemaModule } = await runnerImport<typeof contentSchema>(
  '/src/core/contentSchema/index.ts',
  inlineConfig,
);
const { module: generatorModule } = await runnerImport<typeof generator>(
  '/tools/content/generateContentSchema.ts',
  inlineConfig,
);

for (const schema of generatorModule.generateContentSchemas(schemaModule.contentKinds)) {
  const target = path.join(rootDir, schema.path);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, schema.text);
  process.stdout.write(`Wrote ${schema.path}\n`);
}
