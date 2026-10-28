import { describe, expect, it } from 'vitest';

import { makeEvent, makeState } from '../../../tests/builders';
import { formatEventId } from '../time';
import { assertStateIsValid } from './assertStateIsValid';
import type { GameState } from './gameState';

describe('assertStateIsValid', () => {
  it('accepts a fresh run', () => {
    expect(() => {
      assertStateIsValid(makeState());
    }).not.toThrow();
  });

  it('rejects an unsorted queue', () => {
    const state: GameState = {
      ...makeState(),
      queue: [
        makeEvent({ id: formatEventId(1), gameMs: 20 }),
        makeEvent({ id: formatEventId(2), gameMs: 10 }),
      ],
    };

    expect(() => {
      assertStateIsValid(state);
    }).toThrow(/sorted/);
  });

  it('rejects duplicate event ids', () => {
    const state: GameState = {
      ...makeState(),
      queue: [makeEvent({ gameMs: 10 }), makeEvent({ gameMs: 20 })],
    };

    expect(() => {
      assertStateIsValid(state);
    }).toThrow(/unique/);
  });

  it('rejects an event scheduled before nowGameMs', () => {
    const state: GameState = { ...makeState(), nowGameMs: 50, queue: [makeEvent({ gameMs: 10 })] };

    expect(() => {
      assertStateIsValid(state);
    }).toThrow(/before nowGameMs/);
  });

  it('rejects non-plain data anywhere in the state', () => {
    const withSet = { ...makeState(), rngStreams: new Set() } as unknown as GameState;
    const withFloat = { ...makeState(), nowGameMs: 0.5 };

    expect(() => {
      assertStateIsValid(withSet);
    }).toThrow(/plain objects/);
    expect(() => {
      assertStateIsValid(withFloat);
    }).toThrow(/safe integers/);
  });
});
