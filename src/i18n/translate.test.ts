import { describe, expect, it } from 'vitest';

import { createTranslator } from './translate';

interface FixtureParams {
  readonly 'inbox.unreadCount': { readonly count: number };
  readonly 'message.status': { readonly status: 'open' | 'resolved' | 'other' };
  readonly 'message.summary': { readonly count: number; readonly sender: string };
  readonly 'help.braces': undefined;
  readonly 'cash.amount': { readonly amount: number };
}

const fixtureCatalog = {
  'inbox.unreadCount': '{count, plural, one {# message} other {# messages}}',
  'message.status': '{status, select, open {Open} resolved {Resolved} other {Unknown}}',
  'message.summary': '{sender} sent {count, plural, one {one message} other {# messages}}',
  'help.braces': "Type '{'name'}' to mention someone.",
  'cash.amount': 'Balance {amount, number}',
};

const translate = createTranslator<FixtureParams>(fixtureCatalog, 'en');

describe('createTranslator', () => {
  it.each([
    [0, '0 messages'],
    [1, '1 message'],
    [2, '2 messages'],
    [1000, '1,000 messages'],
  ])('renders the plural for %i as "%s"', (count, expected) => {
    expect(translate('inbox.unreadCount', { count })).toBe(expected);
  });

  it.each([
    ['open', 'Open'],
    ['resolved', 'Resolved'],
    ['other', 'Unknown'],
  ] as const)('renders the select option %s', (status, expected) => {
    expect(translate('message.status', { status })).toBe(expected);
  });

  it('renders an argument next to a nested plural', () => {
    expect(translate('message.summary', { sender: 'Dora', count: 3 })).toBe('Dora sent 3 messages');
  });

  it('renders quoted braces as literal text', () => {
    expect(translate('help.braces')).toBe('Type {name} to mention someone.');
  });

  it('formats a number argument with the locale', () => {
    expect(translate('cash.amount', { amount: 12400 })).toBe('Balance 12,400');
  });

  it('throws on a key the catalog lacks, since key types make that a bug', () => {
    const missing = createTranslator<{ readonly 'help.gone': undefined }>(
      {} as { readonly 'help.gone': string },
      'en',
    );
    expect(() => missing('help.gone')).toThrow(/no UI string for key help.gone/);
  });

  it('rejects unknown keys and wrong arguments at compile time', () => {
    const typecheckOnly = (): void => {
      // @ts-expect-error unknown keys must not compile (CNT-08).
      translate('unknown.key');
      // @ts-expect-error a message with arguments needs them.
      translate('inbox.unreadCount');
      // @ts-expect-error a misnamed argument is rejected.
      translate('inbox.unreadCount', { total: 3 });
      // @ts-expect-error a select only takes its option names.
      translate('message.status', { status: 'closed' });
    };
    expect(typecheckOnly).toBeTypeOf('function');
  });
});
