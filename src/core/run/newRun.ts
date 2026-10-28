import { GAME_DAY_MS } from '../constants';
import { deriveRngStreams } from '../rng';
import { scheduleEvent } from '../time';
import { assertStateIsValid } from './assertStateIsValid';
import type { GameState } from './gameState';
import type { RunStart } from './runStart';

export function newRun(start: RunStart): GameState {
  const empty: GameState = {
    ...start,
    nowGameMs: 0,
    queue: [],
    rngStreams: deriveRngStreams(start.seed),
    counters: { event: 0 },
    inputLog: [],
  };
  const state = scheduleEvent(empty, { gameMs: GAME_DAY_MS, kind: 'dayBoundary' });
  assertStateIsValid(state);
  return state;
}
