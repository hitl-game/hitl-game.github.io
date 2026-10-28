import { assertInvariant, type Brand } from '../../shared';
import { RUN_SEED_MAX } from '../constants';

export type RunSeed = Brand<number, 'RunSeed'>;

export function toRunSeed(value: number): RunSeed {
  assertInvariant(
    Number.isSafeInteger(value) && value >= 0 && value <= RUN_SEED_MAX,
    `a run seed is an integer in 0..${String(RUN_SEED_MAX)}`,
  );
  return value as RunSeed;
}
