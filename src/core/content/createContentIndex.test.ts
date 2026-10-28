import { describe, expect, it } from 'vitest';

import { makeContentPack } from '../../../tests/builders';
import { phases } from '../constants';
import { createContentIndex } from './createContentIndex';

describe('createContentIndex', () => {
  const pack = makeContentPack();
  const content = createContentIndex(pack);

  it('exposes the pack tuning with typed lookups', () => {
    expect(content.tuning).toBe(pack.tuning);
    expect(content.tuning.phases.garage.baseCostsPerDayCents).toBe(35_000);
  });

  it.each(phases)('returns no templates for the %s phase until a template kind exists', (phase) => {
    expect(content.templatesFor('general', phase)).toEqual([]);
  });

  it('is frozen plain data', () => {
    expect(Object.isFrozen(content)).toBe(true);
    expect(Object.getPrototypeOf(content)).toBe(Object.prototype);
  });
});
