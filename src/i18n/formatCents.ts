import { formatNumber } from './formatNumber';
import { toWholeDollars } from './toWholeDollars';

// Always full whole-dollar digits, for places where money must never abbreviate (receipts,
// PDF, tooltips). Ordinary display uses formatCompactCents.
export const formatCents = (cents: number): string =>
  formatNumber('wholeUsd', toWholeDollars(cents));
