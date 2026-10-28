import {
  assertStateIsValid,
  newRun,
  scheduleEvent,
  type GameState,
  type PendingEvent,
} from '../../src/core';
import { deepFreeze } from './deepFreeze';
import { makeRunStart } from './makeRunStart';

export function makeState(overrides: Partial<GameState> = {}): GameState {
  const state = { ...newRun(makeRunStart()), ...overrides };
  assertStateIsValid(state);
  return deepFreeze(state);
}

export function makeStateWithEvents(pending: readonly PendingEvent[]): GameState {
  return deepFreeze(pending.reduce(scheduleEvent, makeState()));
}
