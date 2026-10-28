import type { AdvanceMode, AdvanceContext, EconomyTuning } from '../../src/core';
import { makeContentPack, type TuningOverrides } from './makeContentPack';

// Parsed once: every state and context builder reads the real file, and the properties
// build thousands of them.
const defaultTuning: EconomyTuning = makeContentPack().tuning;

export const makeEconomyTuning = (overrides: TuningOverrides = {}): EconomyTuning =>
  Object.keys(overrides).length === 0 ? defaultTuning : makeContentPack(overrides).tuning;

export const makeAdvanceContext = (
  mode: AdvanceMode = 'present',
  tuningOverrides: TuningOverrides = {},
): AdvanceContext => ({ mode, tuning: makeEconomyTuning(tuningOverrides) });
