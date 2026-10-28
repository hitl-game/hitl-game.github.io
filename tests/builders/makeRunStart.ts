import { toRunSeed, type RunStart, type Settings } from '../../src/core';

const defaultSettings: Settings = { timing: 'standard', gameSpeed: 'full' };

export function makeRunStart(overrides: Partial<RunStart> = {}): RunStart {
  return {
    seed: toRunSeed(42),
    loopNumber: 1,
    contentPackVersion: 'test-pack-1',
    settings: defaultSettings,
    ...overrides,
  };
}
