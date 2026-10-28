import { err, ok, type Result } from '../../shared';
import {
  BP_PER_HYPE_POINT,
  BP_PER_MULTIPLIER,
  BP_PER_PERCENT,
  CENTS_PER_DOLLAR,
  DECIMAL_BASE,
  GAME_DAY_MS,
  MILLI_PER_POINT,
  MS_PER_SECOND,
  SECONDS_PER_MINUTE,
} from '../constants';
import { divideRounded, withoutNegativeZero } from '../numerics';

interface ConversionError {
  readonly reason: string;
}

export type Conversion = Result<number, ConversionError>;

interface IntegerUnit {
  readonly factor: number;
  readonly name: string;
}

const fail = (reason: string): Conversion => err({ reason });

// The shortest decimal text of a double is what the author typed (YAML `0.07` reads back as
// "0.07"), so splitting it into an integer mantissa and a count of decimal places converts
// without any float arithmetic: no Math.round, no toFixed (C-1).
function scaleDecimal(value: number, unit: IntegerUnit): Conversion {
  const text = String(value);
  if (!Number.isFinite(value)) return fail(`${text} is not a finite number`);
  if (/e/i.test(text)) return fail(`${text} needs exponent notation; write it in ${unit.name}`);
  const [integerDigits = '', fractionDigits = ''] = text.replace('-', '').split('.');
  const mantissa = Number(integerDigits + fractionDigits);
  const divisor = DECIMAL_BASE ** fractionDigits.length;
  if (!Number.isSafeInteger(mantissa) || !Number.isSafeInteger(divisor)) {
    return fail(`${text} has too many digits to convert exactly`);
  }
  // Dividing by the common factor first keeps every intermediate value a safe integer.
  const common = findGreatestCommonDivisor(unit.factor, divisor);
  const remainingDivisor = divideRounded(divisor, common);
  if (mantissa % remainingDivisor !== 0)
    return fail(`${text} is not a whole number of ${unit.name}`);
  const magnitude = divideRounded(mantissa, remainingDivisor) * divideRounded(unit.factor, common);
  if (!Number.isSafeInteger(magnitude))
    return fail(`${text} is too large to store in ${unit.name}`);
  return ok(withoutNegativeZero(text.startsWith('-') ? -magnitude : magnitude));
}

const findGreatestCommonDivisor = (a: number, b: number): number =>
  b === 0 ? a : findGreatestCommonDivisor(b, a % b);

const toUnit =
  (factor: number, name: string) =>
  (value: number): Conversion =>
    scaleDecimal(value, { factor, name });

export const usdToCents = toUnit(CENTS_PER_DOLLAR, 'cents');
export const percentToBp = toUnit(BP_PER_PERCENT, 'basis points');
export const multiplierToBp = toUnit(BP_PER_MULTIPLIER, 'basis points');
export const hypeIndexToBp = toUnit(BP_PER_HYPE_POINT, 'basis points');
export const alignmentPointsToMilli = toUnit(MILLI_PER_POINT, 'milli-points');
export const toMilli = toUnit(MILLI_PER_POINT, 'thousandths');
export const secondsToRealMs = toUnit(MS_PER_SECOND, 'milliseconds');
export const secondsToGameMs = toUnit(MS_PER_SECOND, 'game milliseconds');
export const activeMinutesToGameMs = toUnit(
  MS_PER_SECOND * SECONDS_PER_MINUTE,
  'game milliseconds',
);
export const daysToGameMs = toUnit(GAME_DAY_MS, 'game milliseconds');
