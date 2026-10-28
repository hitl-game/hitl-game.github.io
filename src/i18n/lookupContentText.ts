// Content catalogs (locales/<lang>/content/*.yaml) are flat maps keyed `<contentId>.<field path>`.
export type ContentCatalog = Readonly<Record<string, string>>;

export interface ContentTextQuery {
  // The active locale's content catalog; undefined while the locale is English.
  readonly catalog: ContentCatalog | undefined;
  readonly contentId: string;
  readonly fieldPath: string;
  // The English text stays inline in the content YAML and is the fallback.
  readonly english: string;
}

export function lookupContentText(query: ContentTextQuery): string {
  const translated = query.catalog?.[`${query.contentId}.${query.fieldPath}`];
  return translated === undefined || translated === '' ? query.english : translated;
}
