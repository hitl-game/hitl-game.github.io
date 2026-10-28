import { err, ok, type Result } from '../shared';
import { setLocale } from './locale';
import type { Locale } from './supportedLocales';
import type { Catalog } from './translate';

export type LocaleCatalog = Readonly<Partial<Catalog>>;

type LoadCatalog = () => Promise<LocaleCatalog>;

export interface LocaleLoadError {
  readonly locale: string;
  readonly reason: string;
}

// Loads a catalog only on demand and keeps it; a failed load is not cached, so a retry can work.
export function createLocaleLoader(
  loaders: Readonly<Partial<Record<string, LoadCatalog>>>,
): (locale: string) => Promise<Result<LocaleCatalog, LocaleLoadError>> {
  const loaded = new Map<string, LocaleCatalog>();
  return async (locale) => {
    const cached = loaded.get(locale);
    if (cached !== undefined) return ok(cached);
    const load = loaders[locale];
    if (load === undefined) return err({ locale, reason: 'no catalog for this locale' });
    try {
      const catalog = await load();
      loaded.set(locale, catalog);
      return ok(catalog);
    } catch (error) {
      return err({ locale, reason: error instanceof Error ? error.message : String(error) });
    }
  };
}

// English is in the main bundle (it is the fallback for every key); every other locale is a
// lazy chunk. The glob matches nothing until the first translation lands.
const lazyCatalogs = import.meta.glob<LocaleCatalog>(
  ['../../locales/*/ui.json', '!../../locales/en/ui.json'],
  { import: 'default' },
);

const toLocaleName = (catalogPath: string): string => catalogPath.split('/').at(-2) ?? catalogPath;

const loadCatalog = createLocaleLoader({
  ...Object.fromEntries(
    Object.entries(lazyCatalogs).map(([catalogPath, load]) => [toLocaleName(catalogPath), load]),
  ),
  en: () => Promise.resolve({}),
});

// The active locale changes only once its catalog is in memory. When two loads overlap, the one
// requested last wins; an earlier one that finishes later reports an error and changes nothing.
let latestRequest = 0;

export async function loadLocale(locale: Locale): Promise<Result<Locale, LocaleLoadError>> {
  latestRequest += 1;
  const request = latestRequest;
  const catalog = await loadCatalog(locale);
  if (!catalog.ok) return catalog;
  if (request !== latestRequest) return err({ locale, reason: 'superseded by a newer request' });
  setLocale(locale, catalog.value);
  return ok(locale);
}
