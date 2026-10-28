import { assertInvariant, err, ok, type Result } from '../../shared';
import type { Command, CommandError } from './command';
import type { CoreStep } from './coreStep';
import type { GameState } from './gameState';
import type { InputLogEntry } from './inputLogEntry';
import type { Settings } from './settings';

function assertUnknownCommand(command: never): never {
  assertInvariant(false, `unknown command ${JSON.stringify(command)}`);
}

function changeSetting(settings: Settings, command: Command): Result<Settings, CommandError> {
  switch (command.type) {
    case 'changeGameSpeed':
      if (settings.gameSpeed === command.speed) return err('settingUnchanged');
      return ok({ ...settings, gameSpeed: command.speed });
    case 'changeTiming':
      if (settings.timing === command.timing) return err('settingUnchanged');
      return ok({ ...settings, timing: command.timing });
    default:
      // Only a corrupt log or save can get here: the type system covers every live caller.
      return assertUnknownCommand(command);
  }
}

export function applyCommand(
  state: GameState,
  command: Command,
  atGameMs: number,
): Result<CoreStep, CommandError> {
  // Live play and replay both advance first, so any other time is a caller bug, not a
  // player-reachable failure (C-4).
  assertInvariant(atGameMs === state.nowGameMs, 'a command applies at nowGameMs: advance first');
  const settings = changeSetting(state.settings, command);
  if (!settings.ok) return settings;
  // Logged from the state: atGameMs is equal but may be -0, which canonicalize rejects.
  const entry: InputLogEntry = { atGameMs: state.nowGameMs, command };
  return ok({
    state: { ...state, settings: settings.value, inputLog: [...state.inputLog, entry] },
    events: [],
  });
}
