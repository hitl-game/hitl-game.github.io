import { describe, expect, it } from 'vitest';

import { REAL_MS_PER_GAME_MS_BY_SPEED } from '../constants';
import { gameSpeeds } from './gameSpeed';

describe('gameSpeeds', () => {
  it('takes 1, 2 and 4 real ms per game ms at 1×, ½× and ¼×', () => {
    expect(REAL_MS_PER_GAME_MS_BY_SPEED).toEqual({ full: 1, half: 2, quarter: 4 });
  });

  it('gives every speed an integer divisor of at least 1', () => {
    for (const speed of gameSpeeds) {
      const divisor = REAL_MS_PER_GAME_MS_BY_SPEED[speed];
      expect(Number.isSafeInteger(divisor) && divisor >= 1).toBe(true);
    }
  });
});
