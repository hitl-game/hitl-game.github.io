import { getLocale } from './locale';

const numberFormatOptions = {
  wholeUsd: { style: 'currency', currency: 'USD', maximumFractionDigits: 0 },
  compactUsd: {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  },
  percent: { style: 'percent', maximumFractionDigits: 2 },
  wholeNumber: { maximumFractionDigits: 0 },
  minutes: { maximumFractionDigits: 0, useGrouping: false },
  seconds: { minimumIntegerDigits: 2, maximumFractionDigits: 0 },
} as const satisfies Readonly<Record<string, Intl.NumberFormatOptions>>;

type NumberFormatName = keyof typeof numberFormatOptions;

// Formatters run on every KPI render, so each Intl.NumberFormat is built once per locale.
const numberFormats = new Map<string, Intl.NumberFormat>();

const findNumberFormat = (name: NumberFormatName): Intl.NumberFormat => {
  const locale = getLocale();
  const cacheKey = `${locale}:${name}`;
  const cached = numberFormats.get(cacheKey);
  if (cached !== undefined) return cached;
  const created = new Intl.NumberFormat(locale, numberFormatOptions[name]);
  numberFormats.set(cacheKey, created);
  return created;
};

// Intl emits ASCII "-"; on screen a negative number carries a real minus sign (U+2212).
export const formatNumber = (
  name: NumberFormatName,
  value: number | bigint | Intl.StringNumericLiteral,
): string =>
  findNumberFormat(name)
    .formatToParts(value)
    .map((part) => (part.type === 'minusSign' ? '−' : part.value))
    .join('');
