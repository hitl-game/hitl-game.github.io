import type * as z from 'zod';

import { tuningSchema } from './tuningSchema';

// The seam Story 7.1 extends: a new kind is one more entry, the compiler stays as it is (C-6).
// A `single` kind is one file whose item becomes `pack[name]`; a `many` kind collects one item
// per file into an array, in path order.
export interface ContentKind {
  readonly name: string;
  readonly matches: (path: string) => boolean;
  readonly schema: z.ZodType;
  readonly cardinality: 'single' | 'many';
}

export const contentKinds: readonly ContentKind[] = [
  {
    name: 'tuning',
    matches: (path) => path === 'content/tuning.yaml',
    schema: tuningSchema,
    cardinality: 'single',
  },
];
