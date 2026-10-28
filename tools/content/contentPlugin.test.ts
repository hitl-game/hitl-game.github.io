import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  normalizePath,
  type HmrContext,
  type Plugin,
  type Rolldown,
  type ViteDevServer,
} from 'vite';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { stringify } from 'yaml';

import { makeTuningInput, readTuningSource, type TuningOverrides } from '../../tests/builders';
import { contentPackModuleId, contentPlugin } from './contentPlugin';

const resolvedId = `\0${contentPackModuleId}`;
const brokenReason =
  'content/tuning.yaml: phases.garage.baseCostsPerDayUsd: 0.001 is not a whole number of cents';

type Hook<T> = T | { readonly handler: T };

// The plugin ignores the build options buildStart receives.
const buildOptions = {} as Rolldown.NormalizedInputOptions;
const resolveOptions = { isEntry: false };

// Calls a plugin hook the way Vite does, with only the context members the plugin uses.
async function callHook<Args extends unknown[]>(
  hook: Hook<(...args: Args) => unknown> | undefined,
  ...args: Args
): Promise<unknown> {
  if (hook === undefined) throw new Error('missing hook');
  const handler = 'handler' in hook ? hook.handler : hook;
  const context = {
    error: (message: string): never => {
      throw new Error(message);
    },
  };
  return await handler.apply(context, args);
}

interface FakeServer {
  readonly server: ViteDevServer;
  readonly sent: unknown[];
  readonly invalidated: unknown[];
}

// The one test double: Vite's dev server at the plugin boundary.
function makeFakeServer(): FakeServer {
  const sent: unknown[] = [];
  const invalidated: unknown[] = [];
  const virtualModule = { id: resolvedId };
  const server = {
    ws: { send: (payload: unknown) => sent.push(payload) },
    moduleGraph: {
      getModuleById: (id: string) => (id === resolvedId ? virtualModule : undefined),
      invalidateModule: (module: unknown) => invalidated.push(module),
    },
  } as unknown as ViteDevServer;
  return { server, sent, invalidated };
}

describe('contentPlugin', () => {
  let rootDir = '';
  const tuningPath = (): string => path.join(rootDir, 'content', 'tuning.yaml');
  const writeTuning = (overrides: TuningOverrides): Promise<void> =>
    writeFile(tuningPath(), stringify(makeTuningInput(overrides)));

  const startPlugin = async (command: 'build' | 'serve'): Promise<Plugin> => {
    const plugin = contentPlugin(rootDir);
    await callHook(plugin.config, {}, { command, mode: 'test' });
    return plugin;
  };

  const hotUpdate = (plugin: Plugin, server: ViteDevServer, file: string): Promise<unknown> =>
    callHook(plugin.handleHotUpdate, {
      file: normalizePath(file),
      timestamp: 0,
      modules: [],
      read: () => '',
      server,
    } satisfies HmrContext);

  beforeEach(async () => {
    rootDir = await mkdtemp(path.join(tmpdir(), 'hitl-content-'));
    await mkdir(path.join(rootDir, 'content'));
    await writeFile(tuningPath(), readTuningSource());
  });

  afterEach(async () => {
    await rm(rootDir, { recursive: true, force: true });
  });

  it('resolves only the virtual content pack id', async () => {
    const plugin = await startPlugin('serve');

    expect(await callHook(plugin.resolveId, contentPackModuleId, undefined, resolveOptions)).toBe(
      resolvedId,
    );
    expect(await callHook(plugin.resolveId, './other', undefined, resolveOptions)).toBeNull();
  });

  it('loads the compiled pack and its version as module text', async () => {
    const plugin = await startPlugin('serve');
    await callHook(plugin.buildStart, buildOptions);

    const text = String(await callHook(plugin.load, resolvedId));

    expect(text).toContain('export const contentPack = {');
    expect(text).toContain('"baseCostsPerDayCents":35000');
    expect(text).toMatch(/export const contentPackVersion = "[0-9a-f]{64}";/);
  });

  it('fails the build with file, field and reason', async () => {
    await writeTuning({ 'phases.garage.baseCostsPerDayUsd': 0.001 });
    const plugin = await startPlugin('build');

    await expect(callHook(plugin.buildStart, buildOptions)).rejects.toThrow(brokenReason);
  });

  it('fails the dev load with file and field when no good pack exists yet', async () => {
    await writeTuning({ 'phases.garage.baseCostsPerDayUsd': 0.001 });
    const plugin = await startPlugin('serve');
    await callHook(plugin.buildStart, buildOptions);

    await expect(callHook(plugin.load, resolvedId)).rejects.toThrow(brokenReason);
  });

  it('shows a content error in the overlay, keeps the last good pack, then reloads once fixed', async () => {
    const { server, sent, invalidated } = makeFakeServer();
    const plugin = await startPlugin('serve');
    await callHook(plugin.buildStart, buildOptions);
    const goodText = await callHook(plugin.load, resolvedId);

    await writeTuning({ 'phases.garage.baseCostsPerDayUsd': 0.001 });
    expect(await hotUpdate(plugin, server, tuningPath())).toEqual([]);
    expect(sent).toEqual([
      {
        type: 'error',
        err: {
          message: brokenReason,
          stack: '',
          plugin: 'hitl-content-pack',
          id: normalizePath(tuningPath()),
        },
      },
    ]);
    expect(await callHook(plugin.load, resolvedId)).toBe(goodText);

    await writeTuning({ 'phases.garage.baseCostsPerDayUsd': 400 });
    expect(await hotUpdate(plugin, server, tuningPath())).toEqual([]);
    expect(sent.at(-1)).toEqual({ type: 'full-reload' });
    expect(invalidated).toEqual([{ id: resolvedId }]);
    const reloadedText = String(await callHook(plugin.load, resolvedId));
    expect(reloadedText).toContain('"baseCostsPerDayCents":40000');
    expect(reloadedText).not.toBe(goodText);
  });

  it('leaves files outside content/ to Vite', async () => {
    const { server, sent } = makeFakeServer();
    const plugin = await startPlugin('serve');

    expect(await hotUpdate(plugin, server, path.join(rootDir, 'src', 'main.tsx'))).toBeUndefined();
    expect(sent).toEqual([]);
  });
});
