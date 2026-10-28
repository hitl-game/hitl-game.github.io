import { assertInvariant } from '../shared';

const CENTS_PER_DOLLAR = 100n;
const HALF_DOLLAR_CENTS = 50n;

// Exact integer rounding, half away from zero, without float arithmetic on money.
export function toWholeDollars(cents: number): bigint {
  assertInvariant(Number.isSafeInteger(cents), `money must be integer cents, got ${String(cents)}`);
  const dollars = (BigInt(Math.abs(cents)) + HALF_DOLLAR_CENTS) / CENTS_PER_DOLLAR;
  return cents < 0 ? -dollars : dollars;
}
