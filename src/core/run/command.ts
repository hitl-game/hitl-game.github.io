import type { GameSpeed } from '../time';
import type { Timing } from './settings';

export type Command =
  | { readonly type: 'changeGameSpeed'; readonly speed: GameSpeed }
  | { readonly type: 'changeTiming'; readonly timing: Timing };

export type CommandError = 'settingUnchanged';
