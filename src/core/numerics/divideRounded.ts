import { assertInvariant } from '../../shared';
import { withoutNegativeZero } from './withoutNegativeZero';

// The only rounding path in core/: integer division, half away from zero, with no float
// division and no Math.round, so every engine produces the same integer (DET-08).
export function divideRounded(numerator: number, denominator: number): number {
  assertInvariant(
    Number.isSafeInteger(numerator) && Number.isSafeInteger(denominator),
    'divideRounded takes safe integers',
  );
  assertInvariant(denominator !== 0, 'divideRounded never divides by zero');
  const remainder = numerator % denominator;
  const truncated = (numerator - remainder) / denominator;
  const twiceRemainder = Math.abs(remainder) + Math.abs(remainder);
  const rounded =
    twiceRemainder < Math.abs(denominator)
      ? truncated
      : truncated + Math.sign(numerator) * Math.sign(denominator);
  // A zero quotient of a negative operand is -0 in IEEE 754.
  return withoutNegativeZero(rounded);
}
