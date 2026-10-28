import type { Phase } from '../constants';
import type { ContentPack } from './contentPack';

// Story 7.1 widens this with the template kind.
export interface TemplateContent {
  readonly id: string;
}

export interface ContentIndex {
  readonly tuning: ContentPack['tuning'];
  readonly templatesFor: (channel: string, phase: Phase) => readonly TemplateContent[];
}

const noTemplates: readonly TemplateContent[] = Object.freeze([]);

// Freezes in place: the pack is a shared module literal, so a mutation by any consumer would
// change tuning for every index and silently break replay against the pinned pack version.
function deepFreeze<T>(value: T): T {
  if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const child of Object.values(value)) deepFreeze(child);
  }
  return value;
}

// Built once from the pack and passed to the core as an argument, never imported (D6).
export function createContentIndex(pack: ContentPack): ContentIndex {
  return Object.freeze({
    tuning: deepFreeze(pack.tuning),
    templatesFor: () => noTemplates,
  });
}
