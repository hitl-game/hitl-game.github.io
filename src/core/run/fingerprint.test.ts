import { describe, expect, it } from 'vitest';

import { makeEconomyTuning, makeRunStart, makeState } from '../../../tests/builders';
import { applyCommand } from './applyCommand';
import { fingerprint } from './fingerprint';
import type { GameState } from './gameState';
import { newRun } from './newRun';
import { toRunSeed } from './runSeed';

const tuning = makeEconomyTuning();

describe('fingerprint', () => {
  it('is a 64-character hex SHA-256 digest', () => {
    expect(fingerprint(makeState())).toMatch(/^[0-9a-f]{64}$/);
  });

  it('ignores key insertion order', () => {
    const state = makeState();
    const reordered = Object.fromEntries(Object.entries(state).reverse()) as GameState;

    expect(fingerprint(reordered)).toBe(fingerprint(state));
  });

  it.each([
    ['seed', { seed: toRunSeed(43) }],
    ['loop number', { loopNumber: 2 }],
    ['content pack version', { contentPackVersion: 'test-pack-2' }],
    ['settings', { settings: { timing: 'relaxed', gameSpeed: 'full' } }],
  ] as const)('changes when the %s changes', (_, overrides) => {
    const base = newRun(makeRunStart(), tuning);

    expect(fingerprint(newRun(makeRunStart(overrides), tuning))).not.toBe(fingerprint(base));
  });

  it('changes when the cash changes', () => {
    const state = makeState();

    expect(fingerprint(makeState({ cashCents: state.cashCents - 1 }))).not.toBe(fingerprint(state));
  });

  it('changes when the input log changes', () => {
    const state = makeState();
    const logged = applyCommand(state, { type: 'changeGameSpeed', speed: 'half' }, 0);

    expect(logged.ok).toBe(true);
    if (!logged.ok) return;
    expect(fingerprint(logged.value.state)).not.toBe(fingerprint(state));
  });
});
