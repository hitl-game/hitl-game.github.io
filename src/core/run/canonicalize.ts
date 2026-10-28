import { assertInvariant } from '../../shared';

// Deterministic text for plain integer data: sorted keys, arrays in order, no engine-dependent
// formatting. Anything else is a bug in the state, so it throws.

function canonicalizeNumber(value: number): string {
  assertInvariant(
    Number.isSafeInteger(value),
    `canonical numbers are safe integers, got ${String(value)}`,
  );
  assertInvariant(!Object.is(value, -0), 'canonical numbers never carry a negative zero');
  return String(value);
}

function canonicalizeArray(items: readonly unknown[], ancestors: readonly object[]): string {
  assertInvariant(
    Object.getPrototypeOf(items) === Array.prototype,
    'canonical arrays are plain arrays',
  );
  // Array.from visits holes as undefined, which canonicalizeValue rejects like any undefined.
  return `[${Array.from(items, (item) => canonicalizeValue(item, ancestors)).join(',')}]`;
}

function canonicalizeRecord(value: object, ancestors: readonly object[]): string {
  assertInvariant(
    Object.getPrototypeOf(value) === Object.prototype,
    'canonical objects are plain objects: no classes, Map or Set',
  );
  assertInvariant(
    Object.getOwnPropertySymbols(value).length === 0,
    'canonical objects have no symbol keys',
  );
  const record = value as Readonly<Record<string, unknown>>;
  const fields = Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalizeValue(record[key], ancestors)}`);
  return `{${fields.join(',')}}`;
}

function canonicalizeObject(value: object, ancestors: readonly object[]): string {
  assertInvariant(!ancestors.includes(value), 'canonical data has no cycles');
  const nested = [...ancestors, value];
  return Array.isArray(value)
    ? canonicalizeArray(value as readonly unknown[], nested)
    : canonicalizeRecord(value, nested);
}

function canonicalizeValue(value: unknown, ancestors: readonly object[]): string {
  switch (typeof value) {
    case 'number':
      return canonicalizeNumber(value);
    case 'string':
      return JSON.stringify(value);
    case 'boolean':
      return String(value);
    case 'object':
      return value === null ? 'null' : canonicalizeObject(value, ancestors);
    default:
      assertInvariant(false, `canonical data has no ${typeof value} values`);
  }
}

export const canonicalize = (value: unknown): string => canonicalizeValue(value, []);
