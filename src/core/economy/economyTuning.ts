import type { CompiledTuning } from '../contentSchema';

// The groups of the compiled pack the economy reads. Tuning reaches the core as an argument,
// never as an import (D6), so replay with the same pinned pack gives the same run.
export type EconomyTuning = Readonly<Pick<CompiledTuning, 'start' | 'phases' | 'economy'>>;
