import { describe, expect, it } from 'vitest';

import { canonicalize } from './canonicalize';

class Point {
  readonly x = 1;
}

describe('canonicalize', () => {
  it('sorts object keys and keeps array order', () => {
    expect(canonicalize({ b: [3, 1, 2], a: { d: 'x', c: true } })).toBe(
      '{"a":{"c":true,"d":"x"},"b":[3,1,2]}',
    );
  });

  it('gives the same text whatever the key insertion order', () => {
    expect(canonicalize({ seed: 1, loopNumber: 2 })).toBe(canonicalize({ loopNumber: 2, seed: 1 }));
  });

  it('escapes strings and accepts null', () => {
    expect(canonicalize({ s: 'a"b\n', n: null })).toBe('{"n":null,"s":"a\\"b\\n"}');
  });

  it.each([
    ['undefined', undefined, /undefined/],
    ['NaN', Number.NaN, /safe integers/],
    ['a float', 1.5, /safe integers/],
    ['an unsafe integer', 2 ** 53, /safe integers/],
    ['a bigint', 1n, /bigint/],
    ['a function', () => 0, /function/],
    ['a symbol', Symbol('s'), /symbol/],
    ['a Map', new Map(), /plain objects/],
    ['a Set', new Set(), /plain objects/],
    ['a class instance', new Point(), /plain objects/],
    ['a null-prototype object', Object.create(null) as object, /plain objects/],
    ['a typed array', new Uint8Array(1), /plain objects/],
    ['an undefined value', { a: undefined }, /undefined/],
    ['a negative zero', -0, /negative zero/],
    ['a sparse array', [1, , 3], /undefined/],
  ])('rejects %s', (_, value, message) => {
    expect(() => canonicalize(value)).toThrow(message);
  });

  it('rejects symbol keys and cycles', () => {
    const cyclic: Record<string, unknown> = {};
    cyclic['self'] = cyclic;

    expect(() => canonicalize({ [Symbol('k')]: 1 })).toThrow(/symbol keys/);
    expect(() => canonicalize(cyclic)).toThrow(/cycles/);
  });

  it('treats the same object reached twice without a cycle as plain data', () => {
    const shared = { v: 1 };

    expect(canonicalize([shared, shared])).toBe('[{"v":1},{"v":1}]');
  });
});
