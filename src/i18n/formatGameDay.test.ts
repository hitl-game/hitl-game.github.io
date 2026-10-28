import { describe, expect, it } from 'vitest';

import { formatGameDay } from './formatGameDay';

const gameDayMs = 60_000;

describe('formatGameDay', () => {
  it.each([
    [0, 'Day 1'],
    [gameDayMs - 1, 'Day 1'],
    [gameDayMs, 'Day 2'],
    [37 * gameDayMs, 'Day 38'],
    [37 * gameDayMs + 59_999, 'Day 38'],
    [999 * gameDayMs, 'Day 1,000'],
  ])('renders %i game-ms as %s', (gameMs, expected) => {
    expect(formatGameDay(gameMs, gameDayMs)).toBe(expected);
  });

  it.each([
    [-1, gameDayMs],
    [1.5, gameDayMs],
    [0, 0],
    [0, -gameDayMs],
    [0, 0.5],
  ])('treats game-ms %s with a day of %s ms as a bug', (gameMs, dayMs) => {
    expect(() => formatGameDay(gameMs, dayMs)).toThrow(/Invariant violated/);
  });
});
