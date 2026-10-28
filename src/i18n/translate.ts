import { IntlMessageFormat } from 'intl-messageformat';

import { assertInvariant } from '../shared';
import type { Locale } from './supportedLocales';
import type { UiParams } from './uiKeys';

type MessageValues = Readonly<Record<string, string | number | Date>>;

type ParamsByKey<Params> = { readonly [Key in keyof Params]: MessageValues | undefined };

type TranslateArgs<Values> = Values extends undefined ? [] : [values: Values];

export type Translate<Params extends ParamsByKey<Params> = UiParams> = <
  Key extends keyof Params & string,
>(
  key: Key,
  ...args: TranslateArgs<Params[Key]>
) => string;

export type Catalog<Params extends ParamsByKey<Params> = UiParams> = Readonly<
  Record<keyof Params & string, string>
>;

// One IntlMessageFormat per key, built on first use: parsing is the expensive part.
export function createTranslator<Params extends ParamsByKey<Params> = UiParams>(
  catalog: Catalog<Params>,
  locale: Locale,
): Translate<Params> {
  const formats = new Map<string, IntlMessageFormat>();
  const findFormat = (key: string): IntlMessageFormat => {
    const cached = formats.get(key);
    if (cached !== undefined) return cached;
    assertInvariant(Object.hasOwn(catalog, key), `no UI string for key ${key}`);
    const created = new IntlMessageFormat(catalog[key as keyof Catalog<Params>], locale);
    formats.set(key, created);
    return created;
  };
  const translate = (key: string, values?: MessageValues): string => {
    const output = findFormat(key).format(values);
    assertInvariant(typeof output === 'string', `UI string ${key} did not format to text`);
    return output;
  };
  return translate;
}
