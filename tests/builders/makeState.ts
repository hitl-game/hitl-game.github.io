import {
  assertStateIsValid,
  newRun,
  scheduleEvent,
  type GameState,
  type PendingEvent,
  type RunStart,
} from '../../src/core';
import { deepFreeze } from './deepFreeze';
import { makeRunStart } from './makeRunStart';

export function makeState(
  overrides: Partial<GameState> = {},
  start: RunStart = makeRunStart(),
): GameState {
  const state = { ...newRun(start), ...overrides };
  assertStateIsValid(state);
  return deepFreeze(state);
}

export function makeStateWithEvents(
  pending: readonly PendingEvent[],
  start: RunStart = makeRunStart(),
): GameState {
  return deepFreeze(pending.reduce(scheduleEvent, makeState({}, start)));
}
