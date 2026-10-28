import { describe, expect, it } from 'vitest';

import { collectMessageArguments } from './collectMessageArguments.ts';

const typesOf = (message: string): Record<string, string> => {
  const parsed = collectMessageArguments(message);
  return parsed.ok
    ? Object.fromEntries(parsed.argumentTypes)
    : { problems: parsed.problems.join() };
};

describe('collectMessageArguments', () => {
  it.each([
    ['Hello {name}', { name: 'string' }],
    ['{amount, number}', { amount: 'number' }],
    ['{count, plural, one {# message} other {# messages}}', { count: 'number' }],
    ['{rank, selectordinal, one {#st} other {#th}}', { rank: 'number' }],
    ['{when, date, short}', { when: 'Date | number' }],
    ['{when, time, short}', { when: 'Date | number' }],
    ['{status, select, open {Open} other {Closed}}', { status: '"open" | "other"' }],
    ['No arguments', {}],
  ])('types the arguments of %s', (message, expected) => {
    expect(typesOf(message)).toEqual(expected);
  });

  it('finds arguments nested inside plural and select options', () => {
    expect(
      typesOf('{count, plural, one {{sender} sent one} other {{sender} sent {total, number}}}'),
    ).toEqual({ count: 'number', sender: 'string', total: 'number' });
  });

  it('rejects an argument used with two different kinds', () => {
    expect(collectMessageArguments('{n} and {n, plural, other {#}}')).toEqual({
      ok: false,
      problems: ['argument "n" is used as both string and number'],
    });
  });

  it('rejects markup tags', () => {
    expect(collectMessageArguments('Click <b>here</b>')).toEqual({
      ok: false,
      problems: ['markup tags are not allowed in UI strings'],
    });
  });

  it('reports ICU syntax errors', () => {
    expect(collectMessageArguments('{count, plural, one {#}')).toEqual({
      ok: false,
      problems: [expect.stringMatching(/^ICU syntax error /)],
    });
  });
});
