import {
  assertStateIsValid,
  newRun,
  scheduleEvent,
  type EconomyTuning,
  type GameState,
  type PendingEvent,
  type RunStart,
} from '../../src/core';
import { deepFreeze } from './deepFreeze';
import { makeEconomyTuning } from './makeEconomyTuning';
import { makeRunStart } from './makeRunStart';

export function makeState(
  overrides: Partial<GameState> = {},
  start: RunStart = makeRunStart(),
  tuning: EconomyTuning = makeEconomyTuning(),
): GameState {
  const state = { ...newRun(start, tuning), ...overrides };
  assertStateIsValid(state);
  return deepFreeze(state);
}

export function makeStateWithEvents(
  pending: readonly PendingEvent[],
  start: RunStart = makeRunStart(),
  tuning: EconomyTuning = makeEconomyTuning(),
): GameState {
  return deepFreeze(pending.reduce(scheduleEvent, makeState({}, start, tuning)));
}
