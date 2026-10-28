import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { compileContentDir } from './compileContentDir';

describe('compileContentDir', () => {
  it('returns an author-facing error, not a rejection, when content/ is missing', async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), 'hitl-content-'));
    const result = await compileContentDir(rootDir);

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/^content\/: /);
  });
});
