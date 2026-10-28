import { formatNumber } from './formatNumber';
import { toWholeDollars } from './toWholeDollars';

const COMPACT_FROM_DOLLARS = 100_000n;

// Ordinary money display (ECO-08): full digits below $100,000, compact from $100,000
// ($412.5K, $12.4M). The threshold applies to the rounded dollars that are shown.
export function formatCompactCents(cents: number): string {
  const dollars = toWholeDollars(cents);
  const magnitude = dollars < 0n ? -dollars : dollars;
  return formatNumber(magnitude < COMPACT_FROM_DOLLARS ? 'wholeUsd' : 'compactUsd', dollars);
}
