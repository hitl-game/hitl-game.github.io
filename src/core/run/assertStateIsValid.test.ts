import { describe, expect, it } from 'vitest';

import { makeEvent, makeState } from '../../../tests/builders';
import { formatEventId, type EventId, type EventKind } from '../time';
import { assertStateIsValid } from './assertStateIsValid';
import type { Command } from './command';
import type { GameState } from './gameState';

const halfSpeed: Command = { type: 'changeGameSpeed', speed: 'half' };

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

  it.each([
    ['an unknown event kind', { queue: [makeEvent({ kind: 'constructor' as EventKind })] }, /kind/],
    ['a malformed event id', { queue: [makeEvent({ id: 'evt-1' as EventId })] }, /evt-1/],
    [
      'an event id the counter has not reached',
      { queue: [makeEvent({ id: formatEventId(2) })] },
      /already counted/,
    ],
    [
      'an unknown game speed',
      { settings: { timing: 'standard', gameSpeed: 'double' } },
      /gameSpeed/,
    ],
    [
      'an all-zero rng stream',
      { rngStreams: { ...makeState().rngStreams, deck: [0, 0, 0, 0] } },
      /stream/,
    ],
    [
      'a short rng stream',
      { rngStreams: { ...makeState().rngStreams, deck: [1, 2, 3] } },
      /stream/,
    ],
    [
      'a non-int32 rng word',
      { rngStreams: { ...makeState().rngStreams, deck: [2 ** 32, 1, 2, 3] } },
      /stream/,
    ],
    ['a seed outside the Run ID range', { seed: -5 }, /run seed/],
    [
      'an unreleased rng stream',
      { rngStreams: { ...makeState().rngStreams, bogus: [1, 2, 3, 4] } },
      /released streams only/,
    ],
    ['an unknown counter', { counters: { event: 1, bogus: 0 } }, /event counter only/],
    [
      'an input log entry after nowGameMs',
      { nowGameMs: 100, inputLog: [{ atGameMs: 200, command: halfSpeed }] },
      /input log/,
    ],
    [
      'input log entries out of order',
      {
        nowGameMs: 100,
        inputLog: [
          { atGameMs: 50, command: halfSpeed },
          { atGameMs: 10, command: halfSpeed },
        ],
      },
      /input log/,
    ],
  ])('rejects %s', (_, overrides, message) => {
    const state = { ...makeState(), ...overrides } as GameState;

    expect(() => {
      assertStateIsValid(state);
    }).toThrow(message);
  });
});
