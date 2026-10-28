import { assertInvariant } from '../shared';
import { t } from './locale';

// The caller passes the day length (core's GAME_DAY_MS): i18n/ cannot import core/.
// The run starts on Day 1.
export function formatGameDay(gameMs: number, gameDayMs: number): string {
  assertInvariant(
    Number.isSafeInteger(gameMs) && gameMs >= 0,
    `game time must be a non-negative integer, got ${String(gameMs)}`,
  );
  assertInvariant(
    Number.isSafeInteger(gameDayMs) && gameDayMs > 0,
    `a game day must be a positive integer, got ${String(gameDayMs)}`,
  );
  const day = Number(BigInt(gameMs) / BigInt(gameDayMs)) + 1;
  return t('time.day', { day });
}
