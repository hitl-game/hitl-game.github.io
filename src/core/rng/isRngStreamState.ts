import { RNG_STATE_WORDS } from '../constants';

// Four int32 words, not all zero: the only states xoroshiro128+ can draw from (an all-zero
// state draws the same value for ever).
export const isRngStreamState = (words: readonly number[]): boolean =>
  words.length === RNG_STATE_WORDS &&
  words.every((word) => word === (word | 0)) &&
  words.some((word) => word !== 0);
