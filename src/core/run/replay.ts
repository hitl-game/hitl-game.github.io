import { assertInvariant } from '../../shared';
import { advance, type DomainEvent } from '../time';
import { applyCommand } from './applyCommand';
import { assertStateIsValid } from './assertStateIsValid';
import type { CoreStep } from './coreStep';
import type { GameState } from './gameState';
import type { InputLogEntry } from './inputLogEntry';
import { newRun } from './newRun';
import type { RunStart } from './runStart';

function replayEntry(state: GameState, entry: InputLogEntry): CoreStep {
  // One advance per logged command (C-4). A live session logs a command before it resumes
  // after a blocking stop, so the log alone says where every command was applied.
  const advanced = advance(state, entry.atGameMs, 'present');
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

export function replayFrom(state: GameState, inputLog: readonly InputLogEntry[]): CoreStep {
  let current = state;
  const events: DomainEvent[] = [];
  for (const entry of inputLog) {
    const step = replayEntry(current, entry);
    current = step.state;
    events.push(...step.events);
  }
  assertStateIsValid(current);
  return { state: current, events };
}

export const replay = (start: RunStart, inputLog: readonly InputLogEntry[]): CoreStep =>
  replayFrom(newRun(start), inputLog);
