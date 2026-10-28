import englishCatalog from '../../locales/en/ui.json';
import type { Locale } from './supportedLocales';
import { createTranslator, type Catalog, type Translate } from './translate';

let activeLocale: Locale = 'en';
let activeTranslate = createTranslator(englishCatalog, activeLocale);

export const getLocale = (): Locale => activeLocale;

// app/ owns the locale signal and calls this; i18n/ holds no signals (it imports only shared/).
// Keys missing from a translation (or translated to an empty string) fall back to English.
export function setLocale(locale: Locale, catalog: Readonly<Partial<Catalog>>): void {
  const usable = Object.entries(catalog).filter(
    ([, text]) => typeof text === 'string' && text !== '',
  );
  activeTranslate = createTranslator({ ...englishCatalog, ...Object.fromEntries(usable) }, locale);
  activeLocale = locale;
}

export const t: Translate = (key, ...args) => activeTranslate(key, ...args);
