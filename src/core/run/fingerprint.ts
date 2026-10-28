import { sha256Hex } from '../../shared';
import { canonicalize } from './canonicalize';
import type { GameState } from './gameState';

// Called on save, load, in tests and from the debug panel only: never inside advance or
// applyCommand (architecture D4, hot-path rule).
export const fingerprint = (state: GameState): string => sha256Hex(canonicalize(state));
