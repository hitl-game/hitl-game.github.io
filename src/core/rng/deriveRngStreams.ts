import { assertInvariant, sha256Hex } from '../../shared';
import { HEX_DIGITS_PER_INT32, HEX_RADIX, RNG_STATE_WORDS } from '../constants';
import type { RngStreamName, RngStreams, RngStreamState } from './rngStreams';

// Each stream is hash(runSeed, streamName) (architecture D2): the first 16 bytes of
// SHA-256(`${seed}:${name}`) become the four state words, so streams share no state and
// pure-rand's weak `[-1, ~seed, seed, 0]` seeding is bypassed.
function deriveStreamState(runSeed: number, name: RngStreamName): RngStreamState {
  const digest = sha256Hex(`${String(runSeed)}:${name}`);
  const words = Array.from({ length: RNG_STATE_WORDS }, (_, index) => {
    const start = index * HEX_DIGITS_PER_INT32;
    return parseInt(digest.slice(start, start + HEX_DIGITS_PER_INT32), HEX_RADIX) | 0;
  });
  assertInvariant(
    words.some((word) => word !== 0),
    'xoroshiro128+ must not start from the all-zero state',
  );
  return words;
}

export function deriveRngStreams(runSeed: number): RngStreams {
  const derive = (name: RngStreamName): RngStreamState => deriveStreamState(runSeed, name);
  return {
    messages: derive('messages'),
    deck: derive('deck'),
    candidates: derive('candidates'),
    investors: derive('investors'),
    outcomes: derive('outcomes'),
    headlines: derive('headlines'),
    documents: derive('documents'),
  };
}
