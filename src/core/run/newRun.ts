import { GAME_DAY_MS } from '../constants';
import { createStartingEconomy, type EconomyTuning } from '../economy';
import { deriveRngStreams } from '../rng';
import { scheduleEvent } from '../time';
import { assertStateIsValid } from './assertStateIsValid';
import type { GameState } from './gameState';
import type { RunStart } from './runStart';

export function newRun(start: RunStart, tuning: EconomyTuning): GameState {
  // Fields picked one by one: extra keys on a decoded RunStart must not reach the fingerprint.
  const empty: GameState = {
    seed: start.seed,
    loopNumber: start.loopNumber,
    contentPackVersion: start.contentPackVersion,
    settings: { gameSpeed: start.settings.gameSpeed, timing: start.settings.timing },
    ...createStartingEconomy(tuning),
    customerCount: 0,
    hypeBp: tuning.start.hypeBp,
    alignmentMilli: tuning.start.alignmentMilli,
    nowGameMs: 0,
    queue: [],
    rngStreams: deriveRngStreams(start.seed),
    counters: { event: 0 },
    inputLog: [],
  };
  // Both daily events start at the end of day 1; the economy settles the day that just ended.
  const withDayBoundary = scheduleEvent(empty, { gameMs: GAME_DAY_MS, kind: 'dayBoundary' });
  const state = scheduleEvent(withDayBoundary, { gameMs: GAME_DAY_MS, kind: 'economyStep' });
  assertStateIsValid(state);
  return state;
}
