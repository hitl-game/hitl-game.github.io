import { assertInvariant } from '../../shared';
import type { EconomyTuning } from '../economy';
import { advance, type DomainEvent } from '../time';
import { applyCommand } from './applyCommand';
import { assertStateIsValid } from './assertStateIsValid';
import type { CoreStep } from './coreStep';
import type { GameState } from './gameState';
import type { InputLogEntry } from './inputLogEntry';
import { newRun } from './newRun';
import type { RunStart } from './runStart';

function replayEntry(state: GameState, entry: InputLogEntry, tuning: EconomyTuning): CoreStep {
  // One advance per logged command (C-4). A live session logs a command before it resumes
  // after a blocking stop, so the log alone says where every command was applied.
  const advanced = advance(state, entry.atGameMs, { mode: 'present', tuning });
  assertInvariant(
    advanced.state.nowGameMs === entry.atGameMs,
    'input log entry after an unresolved blocking stop: the log or the code is corrupt',
  );
  const applied = applyCommand(advanced.state, entry.command, entry.atGameMs);
  assertInvariant(
    applied.ok,
    `replay rejected the logged command ${entry.command.type}: the log or the code is corrupt`,
  );
  return { state: applied.value.state, events: [...advanced.events, ...applied.value.events] };
}

export function replayFrom(
  state: GameState,
  inputLog: readonly InputLogEntry[],
  tuning: EconomyTuning,
): CoreStep {
  // A snapshot can be corrupt in a way replay consumes (a stale counter, a misordered event),
  // so it is checked before the fold as well as after.
  assertStateIsValid(state);
  let current = state;
  const events: DomainEvent[] = [];
  for (const entry of inputLog) {
    const step = replayEntry(current, entry, tuning);
    current = step.state;
    events.push(...step.events);
  }
  assertStateIsValid(current);
  return { state: current, events };
}

export const replay = (
  start: RunStart,
  inputLog: readonly InputLogEntry[],
  tuning: EconomyTuning,
): CoreStep => replayFrom(newRun(start, tuning), inputLog, tuning);
