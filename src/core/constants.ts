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
