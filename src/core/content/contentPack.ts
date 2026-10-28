import { sha256Hex } from '../../shared';
import { canonicalize } from '../run';
import type { CompiledTuning } from '../contentSchema';

type DeepReadonly<T> = T extends object ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> } : T;

// Every number in the pack is a safe integer; canonicalize enforces it when the version is computed.
export interface ContentPack {
  readonly tuning: DeepReadonly<CompiledTuning>;
}

// The full 64-character lowercase SHA-256 hex of the canonical pack, so key order, YAML
// comments and authoring metadata never change it (D6).
export const computeContentPackVersion = (pack: object): string => sha256Hex(canonicalize(pack));
