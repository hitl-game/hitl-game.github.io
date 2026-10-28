import { describe, expect, it } from 'vitest';

import { loadContentIndex } from './loadContentIndex';

describe('loadContentIndex', () => {
  it('builds the content index from the compiled content pack', () => {
    const { contentIndex, contentPackVersion } = loadContentIndex();

    expect(contentPackVersion).toMatch(/^[0-9a-f]{64}$/);
    expect(contentIndex.tuning.start.cashCents).toBe(1_240_000);
    expect(contentIndex.tuning.phases.garage.baseCostsPerDayCents).toBe(35_000);
    expect(contentIndex.tuning.phases.garage.gpuUnitCostPerDayCents).toBe(5_000);
    expect(contentIndex.templatesFor('general', 'garage')).toEqual([]);
  });

  it('builds a fresh index on every call', () => {
    expect(loadContentIndex().contentIndex).not.toBe(loadContentIndex().contentIndex);
  });
});
