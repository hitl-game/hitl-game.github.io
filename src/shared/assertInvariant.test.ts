import { describe, expect, it } from 'vitest';

import { assertInvariant } from './assertInvariant';

describe('assertInvariant', () => {
  it('returns silently when the condition holds', () => {
    expect(() => {
      assertInvariant(true, 'holds');
    }).not.toThrow();
  });

  it('throws a plain Error naming the violated invariant', () => {
    expect(() => {
      assertInvariant(false, 'cash must be integer cents');
    }).toThrow(new Error('Invariant violated: cash must be integer cents'));
  });
});
