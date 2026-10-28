import path from 'node:path';
import { normalizePath, runnerImport, type HmrContext, type ModuleNode, type Plugin } from 'vite';

import type * as pipeline from './compileContentDir.ts';
import type { CompiledContent } from './compileContentPack.ts';

export const contentPackModuleId = 'virtual:content-pack';

// The \0 prefix marks a virtual id so no other plugin tries to read it from disk.
const resolvedModuleId = `\0${contentPackModuleId}`;
const pluginName = 'hitl-content-pack';
const contentDirName = 'content';

type Compilation = Awaited<ReturnType<typeof pipeline.compileContentDir>>;

// The compiler imports src/core, whose extensionless imports Vite's config loader cannot run
// natively, so it is loaded through Vite's module runner instead of a static import.
const loadPipeline = async (): Promise<typeof pipeline> => {
  const projectRoot = path.join(import.meta.dirname, '..', '..');
  const { module } = await runnerImport<typeof pipeline>(
    path.join(import.meta.dirname, 'compileContentDir.ts'),
    { root: projectRoot, configFile: false, logLevel: 'error' },
  );
  return module;
};

const toModuleText = ({ pack, contentPackVersion }: CompiledContent): string =>
  `export const contentPack = ${JSON.stringify(pack)};\n` +
  `export const contentPackVersion = ${JSON.stringify(contentPackVersion)};\n`;

interface ContentCompiler {
  readonly compile: () => Promise<Compilation>;
  // The last good pack once one exists, so a broken edit in dev keeps the app running.
  readonly readServable: () => Promise<Compilation>;
}

function createContentCompiler(rootDir: string): ContentCompiler {
  let lastGood: CompiledContent | null = null;
  let latest: Compilation | null = null;
  let loading: Promise<typeof pipeline> | null = null;
  const compile = async (): Promise<Compilation> => {
    loading ??= loadPipeline();
    latest = await (await loading).compileContentDir(rootDir);
    if (latest.ok) lastGood = latest.value;
    return latest;
  };
  return {
    compile,
    readServable: async () => {
      const compilation = latest ?? (await compile());
      return lastGood === null ? compilation : { ok: true, value: lastGood };
    },
  };
}

async function reloadContent(
  { file, server }: HmrContext,
  compiler: ContentCompiler,
): Promise<ModuleNode[]> {
  const compilation = await compiler.compile();
  if (compilation.ok) {
    const module = server.moduleGraph.getModuleById(resolvedModuleId);
    if (module !== undefined) server.moduleGraph.invalidateModule(module);
    server.ws.send({ type: 'full-reload' });
  } else {
    const message = compilation.error;
    server.ws.send({ type: 'error', err: { message, stack: '', plugin: pluginName, id: file } });
  }
  return [];
}

// Compiles content/**/*.yaml into the `virtual:content-pack` module. A content error fails the
// build; in dev it shows in the error overlay while the last good pack keeps being served.
export function contentPlugin(rootDir: string): Plugin {
  // Vite reports changed files with forward slashes on every OS.
  const contentDir = `${normalizePath(path.join(rootDir, contentDirName))}/`;
  const compiler = createContentCompiler(rootDir);
  let isBuild = false;

  return {
    name: pluginName,
    config(_config, env) {
      isBuild = env.command === 'build';
    },
    async buildStart() {
      const compilation = await compiler.compile();
      if (isBuild && !compilation.ok) this.error(compilation.error);
    },
    configureServer(server) {
      server.watcher.add(contentDir);
    },
    resolveId(id) {
      return id === contentPackModuleId ? resolvedModuleId : null;
    },
    async load(id) {
      if (id !== resolvedModuleId) return null;
      const servable = await compiler.readServable();
      if (!servable.ok) this.error(servable.error);
      return toModuleText(servable.value);
    },
    handleHotUpdate(context) {
      return context.file.startsWith(contentDir) ? reloadContent(context, compiler) : undefined;
    },
  };
}
