import { assertInvariant } from '../shared';
import { formatNumber } from './formatNumber';

const BP_PER_UNIT = 10_000n;
const BP_FRACTION_DIGITS = 4;

// Intl takes the ratio as an exact decimal string, so no float division touches the value.
const toRatioLiteral = (bp: number): Intl.StringNumericLiteral => {
  const magnitude = BigInt(Math.abs(bp));
  const whole = String(magnitude / BP_PER_UNIT);
  const fraction = String(magnitude % BP_PER_UNIT).padStart(BP_FRACTION_DIGITS, '0');
  return `${bp < 0 ? '-' : ''}${whole}.${fraction}` as Intl.StringNumericLiteral;
};

export function formatPercentBp(bp: number): string {
  assertInvariant(Number.isSafeInteger(bp), `percentages must be integer bp, got ${String(bp)}`);
  return formatNumber('percent', toRatioLiteral(bp));
}
