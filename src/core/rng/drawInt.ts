import { uniformInt } from 'pure-rand/distribution/uniformInt';
import { xoroshiro128plusFromState } from 'pure-rand/generator/xoroshiro128plus';

import { assertInvariant } from '../../shared';
import type { RngStreamState } from './rngStreams';

export function drawInt(
  stream: RngStreamState,
  min: number,
  max: number,
): readonly [number, RngStreamState] {
  assertInvariant(
    Number.isSafeInteger(min) && Number.isSafeInteger(max) && min <= max,
    'drawInt takes an integer range with min <= max',
  );
  // Wider ranges push pure-rand's intermediate sums past 2^53, which skews the draw.
  assertInvariant(max - min <= Number.MAX_SAFE_INTEGER, 'drawInt range width fits a safe integer');
  // pure-rand generators are mutable objects: rebuild one from the plain state, draw, and
  // keep only the next plain state.
  const generator = xoroshiro128plusFromState(stream);
  const value = uniformInt(generator, min, max);
  return [value, generator.getState()];
}
