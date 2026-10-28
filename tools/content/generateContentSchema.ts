import * as z from 'zod';

import type { ContentKind } from '../../src/core/contentSchema';

export interface GeneratedSchema {
  readonly path: string;
  readonly text: string;
}

// The input side, so editors autocomplete the human-unit keys authors write (`cashUsd`),
// not the compiled integer keys (`cashCents`).
export const generateContentSchemas = (kinds: readonly ContentKind[]): GeneratedSchema[] =>
  kinds.map((kind) => ({
    path: `content/schema/${kind.name}.schema.json`,
    text: `${JSON.stringify(z.toJSONSchema(kind.schema, { io: 'input' }), null, 2)}\n`,
  }));
