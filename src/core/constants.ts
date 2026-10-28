import type { GameSpeed } from './time';

// One real minute is one game day at 1× (GDD Time bases), so game-ms equal real ms.
export const GAME_DAY_MS = 60_000;

// Released stream names are never renamed (architecture D2).
export const rngStreamNames = [
  'messages',
  'deck',
  'candidates',
  'investors',
  'outcomes',
  'headlines',
  'documents',
] as const;

export const RNG_STATE_WORDS = 4;
export const HEX_RADIX = 16;
export const HEX_DIGITS_PER_INT32 = 8;

// A Run ID is 6 Crockford base32 characters (30 bits), so seeds and Run IDs map one to one.
export const RUN_SEED_MAX = 2 ** 30 - 1;

// IDs are zero-padded so plain string order equals creation order (`evt-000001`).
export const ID_SEQUENCE_WIDTH = 6;
export const ID_SEQUENCE_LIMIT = 10 ** ID_SEQUENCE_WIDTH;

export const SORT_BEFORE = -1;
export const SORT_AFTER = 1;

// Phase order is the funding order; Series A+ covers every later round (GDD Level Types).
export const phases = ['garage', 'seed', 'seriesA'] as const;
export type Phase = (typeof phases)[number];

// Integer unit factors: tuning is authored in human units and compiled once to these.
export const CENTS_PER_DOLLAR = 100;
export const BP_PER_PERCENT = 100;
export const BP_PER_MULTIPLIER = 10_000;
export const BP_PER_HYPE_POINT = 100;
export const MILLI_PER_POINT = 1_000;
export const MS_PER_SECOND = 1_000;
export const SECONDS_PER_MINUTE = 60;
export const DECIMAL_BASE = 10;

// Real ms per game ms at each Game speed: the GDD's fixed meaning of 1×, ½× and ¼×, so a
// content pack can never redefine a speed. Integers, so the clock divides once and floors.
export const REAL_MS_PER_GAME_MS_BY_SPEED = {
  full: 1,
  half: 2,
  quarter: 4,
} as const satisfies Record<GameSpeed, number>;
