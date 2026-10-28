import type { GameSpeed, Timing } from './settings';

export type Command =
  | { readonly type: 'changeGameSpeed'; readonly speed: GameSpeed }
  | { readonly type: 'changeTiming'; readonly timing: Timing };

export type CommandError = 'settingUnchanged';
