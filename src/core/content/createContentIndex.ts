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

// Built once from the pack and passed to the core as an argument, never imported (D6).
export function createContentIndex(pack: ContentPack): ContentIndex {
  return Object.freeze({
    tuning: pack.tuning,
    templatesFor: () => noTemplates,
  });
}
