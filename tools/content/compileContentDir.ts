import { contentKinds } from '../../src/core/contentSchema';
import { err, ok, type Result } from '../../src/shared';
import { compileContentPack, formatContentError, type CompiledContent } from './compileContentPack';
import { readContentSources } from './readContentSources';

// Errors come back as one author-facing message: one `file: field: reason` line per error.
export async function compileContentDir(rootDir: string): Promise<Result<CompiledContent, string>> {
  const compiled = compileContentPack(await readContentSources(rootDir), contentKinds);
  return compiled.ok ? ok(compiled.value) : err(compiled.error.map(formatContentError).join('\n'));
}
