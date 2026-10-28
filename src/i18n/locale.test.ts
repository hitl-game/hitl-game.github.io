import { afterEach, describe, expect, it } from 'vitest';

import { getLocale, setLocale, t } from './locale';

describe('t', () => {
  it('renders the English catalog by default', () => {
    expect(getLocale()).toBe('en');
    expect(t('inbox.unreadCount', { count: 1 })).toBe('1 message');
    expect(t('time.day', { day: 38 })).toBe('Day 38');
  });

  it('accepts only generated keys with their arguments', () => {
    const typecheckOnly = (): void => {
      // @ts-expect-error unknown keys must not compile (CNT-08).
      t('unknown.key');
      // @ts-expect-error inbox.unreadCount needs its count.
      t('inbox.unreadCount');
    };
    expect(typecheckOnly).toBeTypeOf('function');
  });
});

describe('setLocale', () => {
  it('keeps English for a key translated to an empty string', () => {
    setLocale('en', { 'time.day': '' });

    expect(t('time.day', { day: 3 })).toBe('Day 3');
    setLocale('en', {});
  });

  afterEach(() => {
    setLocale('en', {});
  });

  it('switches t to the new catalog and falls back to English for missing keys', () => {
    setLocale('en', { 'time.day': 'Jour {day, number}' });

    expect(t('time.day', { day: 2 })).toBe('Jour 2');
    expect(t('inbox.unreadCount', { count: 2 })).toBe('2 messages');
  });
});
