import { REAL_MS_PER_GAME_MS_BY_SPEED } from '../constants';
import { divideRounded } from '../numerics';
import type { GameSpeed } from './gameSpeed';

// Called once when a window opens, with the speed in force then; a later speed change never
// recomputes it (architecture D1, Time bases). Cadences are game-ms already and never pass here.
export const convertRealWindowToGameMs = (windowRealMs: number, speed: GameSpeed): number =>
  divideRounded(windowRealMs, REAL_MS_PER_GAME_MS_BY_SPEED[speed]);
