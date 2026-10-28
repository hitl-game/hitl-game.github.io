import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import type { ContentSource } from './compileContentPack';

const contentDirName = 'content';

// Generated JSON Schemas live beside the content but are not content.
const schemaDir = `${contentDirName}/schema/`;

const toPosixPath = (filePath: string): string => filePath.split(path.sep).join('/');

const isHidden = (relativePath: string): boolean =>
  relativePath.split('/').some((segment) => segment.startsWith('.'));

// Every file under content/ is read, not only *.yaml, so a misplaced file fails the build
// ("no content kind for this path") instead of being silently ignored.
export async function readContentSources(rootDir: string): Promise<ContentSource[]> {
  const entries = await readdir(path.join(rootDir, contentDirName), {
    recursive: true,
    withFileTypes: true,
  });
  const paths = entries
    .filter((entry) => entry.isFile())
    .map((entry) => toPosixPath(path.relative(rootDir, path.join(entry.parentPath, entry.name))))
    .filter((relativePath) => !relativePath.startsWith(schemaDir) && !isHidden(relativePath))
    .sort();
  return Promise.all(
    paths.map(async (relativePath) => ({
      path: relativePath,
      text: await readFile(path.join(rootDir, relativePath), 'utf8'),
    })),
  );
}
