import { describe, expect, it } from 'vitest';

import { lookupContentText } from './lookupContentText';

const query = {
  contentId: 'event.seed.gpu-shortage',
  fieldPath: 'body',
  english: 'GPUs are sold out.',
};

describe('lookupContentText', () => {
  it('returns the translation when the catalog has the key', () => {
    const catalog = { 'event.seed.gpu-shortage.body': 'Les GPU sont épuisés.' };

    expect(lookupContentText({ ...query, catalog })).toBe('Les GPU sont épuisés.');
  });

  it('falls back to English when the key is missing', () => {
    expect(lookupContentText({ ...query, catalog: { 'other.id.body': 'Autre' } })).toBe(
      'GPUs are sold out.',
    );
  });

  it('treats an empty translation as missing', () => {
    const catalog = { 'event.seed.gpu-shortage.body': '' };

    expect(lookupContentText({ ...query, catalog })).toBe('GPUs are sold out.');
  });

  it('uses English when no catalog is loaded', () => {
    expect(lookupContentText({ ...query, catalog: undefined })).toBe('GPUs are sold out.');
  });

  it('keys nested field paths by their dotted path', () => {
    const catalog = { 'event.seed.gpu-shortage.choices.0.label': 'Attendre' };

    expect(
      lookupContentText({ ...query, fieldPath: 'choices.0.label', english: 'Wait', catalog }),
    ).toBe('Attendre');
  });
});
