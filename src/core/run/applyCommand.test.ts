import { describe, expect, it } from 'vitest';

import { makeState } from '../../../tests/builders';
import { applyCommand } from './applyCommand';
import type { Command } from './command';

describe('applyCommand', () => {
  it('applies a valid command and appends it to the input log', () => {
    const state = makeState({ nowGameMs: 250 });

    const result = applyCommand(state, { type: 'changeGameSpeed', speed: 'half' }, 250);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.value.state.settings).toEqual({ timing: 'standard', gameSpeed: 'half' });
    expect(result.value.state.inputLog).toEqual([
      { atGameMs: 250, command: { type: 'changeGameSpeed', speed: 'half' } },
    ]);
    expect(result.value.events).toEqual([]);
    expect(state.inputLog).toEqual([]);
  });

  it('changes timing independently of game speed', () => {
    const state = makeState();

    const result = applyCommand(state, { type: 'changeTiming', timing: 'untimed' }, 0);

    expect(result.ok && result.value.state.settings).toEqual({
      timing: 'untimed',
      gameSpeed: 'full',
    });
  });

  it('rejects a no-op setting change without touching the state or the log (DET-10)', () => {
    const state = makeState();

    const result = applyCommand(state, { type: 'changeTiming', timing: 'standard' }, 0);

    expect(result).toEqual({ ok: false, error: 'settingUnchanged' });
    expect(state.inputLog).toHaveLength(0);
    expect(state.settings).toEqual({ timing: 'standard', gameSpeed: 'full' });
  });

  it('treats an unknown command type from a corrupt log as a bug', () => {
    const unknown = { type: 'bogus' } as unknown as Command;

    expect(() => applyCommand(makeState(), unknown, 0)).toThrow(/unknown command/);
  });

  it('treats a command at any time other than nowGameMs as a caller bug', () => {
    const state = makeState({ nowGameMs: 10 });

    expect(() => applyCommand(state, { type: 'changeGameSpeed', speed: 'half' }, 11)).toThrow(
      /advance first/,
    );
  });
});
