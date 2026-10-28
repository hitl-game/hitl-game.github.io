import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { contentKinds } from '../../src/core/contentSchema';
import { generateContentSchemas } from './generateContentSchema';

const rootDir = path.join(import.meta.dirname, '..', '..');

describe('generateContentSchemas', () => {
  const schemas = generateContentSchemas(contentKinds);

  it.each(schemas)('matches the committed $path (run npm run content:schema)', async (schema) => {
    expect(await readFile(path.join(rootDir, schema.path), 'utf8')).toBe(schema.text);
  });

  it('describes the human-unit keys authors write, not the compiled keys', () => {
    const tuning = schemas.find((schema) => schema.path === 'content/schema/tuning.schema.json');

    expect(tuning?.text).toContain('"cashUsd"');
    expect(tuning?.text).toContain('"baseCostsPerDayUsd"');
    expect(tuning?.text).not.toContain('"cashCents"');
    expect(tuning?.text).not.toContain('Cents"');
  });

  it('rejects unknown keys in the editor too', () => {
    const tuning = schemas.find((schema) => schema.path === 'content/schema/tuning.schema.json');

    expect(tuning?.text).toContain('"additionalProperties": false');
  });
});
