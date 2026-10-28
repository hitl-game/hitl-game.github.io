import type { RunSeed } from './runSeed';
import type { Settings } from './settings';

// Everything replay depends on besides the input log; stored in the save (architecture D4).
export interface RunStart {
  readonly seed: RunSeed;
  readonly loopNumber: number;
  readonly contentPackVersion: string;
  readonly settings: Settings;
}
