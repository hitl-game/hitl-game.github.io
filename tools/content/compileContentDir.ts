import { contentKinds } from '../../src/core/contentSchema';
import { err, ok, type Result } from '../../src/shared';
import { compileContentPack, formatContentError, type CompiledContent } from './compileContentPack';
import { readContentSources } from './readContentSources';

// Errors come back as one author-facing message: one `file: field: reason` line per error.
export async function compileContentDir(rootDir: string): Promise<Result<CompiledContent, string>> {
  let sources;
  try {
    sources = await readContentSources(rootDir);
  } catch (error) {
    // A missing content/ directory or a file that vanished mid-read (editor temp files).
    return err(`content/: ${error instanceof Error ? error.message : String(error)}`);
  }
  const compiled = compileContentPack(sources, contentKinds);
  return compiled.ok ? ok(compiled.value) : err(compiled.error.map(formatContentError).join('\n'));
}
