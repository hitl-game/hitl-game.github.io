import { afterEach, describe, expect, it, vi } from 'vitest';

import { getLocale, setLocale, t } from './locale';
import { createLocaleLoader, loadLocale, type LocaleCatalog } from './loadLocale';

const frenchCatalog: LocaleCatalog = { 'time.day': 'Jour {day, number}' };

describe('createLocaleLoader', () => {
  it('calls a loader only when its locale is requested, then caches the catalog', async () => {
    const loadFrench = vi.fn(() => Promise.resolve(frenchCatalog));
    const loadGerman = vi.fn(() => Promise.resolve({}));
    const loadCatalog = createLocaleLoader({ fr: loadFrench, de: loadGerman });

    expect(loadFrench).not.toHaveBeenCalled();
    expect(await loadCatalog('fr')).toEqual({ ok: true, value: frenchCatalog });
    expect(await loadCatalog('fr')).toEqual({ ok: true, value: frenchCatalog });
    expect(loadFrench).toHaveBeenCalledTimes(1);
    expect(loadGerman).not.toHaveBeenCalled();
  });

  it('returns an error for a chunk that fails to load, and retries next time', async () => {
    const loadFrench = vi
      .fn<() => Promise<LocaleCatalog>>()
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(frenchCatalog);
    const loadCatalog = createLocaleLoader({ fr: loadFrench });

    expect(await loadCatalog('fr')).toEqual({
      ok: false,
      error: { locale: 'fr', reason: 'network down' },
    });
    expect(await loadCatalog('fr')).toEqual({ ok: true, value: frenchCatalog });
  });

  it('returns an error for a locale without a catalog', async () => {
    expect(await createLocaleLoader({})('xx')).toEqual({
      ok: false,
      error: { locale: 'xx', reason: 'no catalog for this locale' },
    });
  });
});

describe('loadLocale', () => {
  afterEach(() => {
    setLocale('en', {});
  });

  it('lets the last requested load win when two overlap', async () => {
    const [first, second] = await Promise.all([loadLocale('en'), loadLocale('en')]);

    expect(first).toEqual({
      ok: false,
      error: { locale: 'en', reason: 'superseded by a newer request' },
    });
    expect(second).toEqual({ ok: true, value: 'en' });
  });

  it('activates English from the main bundle', async () => {
    setLocale('en', { 'time.day': 'Jour {day, number}' });

    expect(await loadLocale('en')).toEqual({ ok: true, value: 'en' });
    expect(getLocale()).toBe('en');
    expect(t('time.day', { day: 3 })).toBe('Day 3');
  });
});
