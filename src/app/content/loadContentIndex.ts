import { contentPack, contentPackVersion } from 'virtual:content-pack';

import { createContentIndex, type ContentIndex } from '../../core';

export interface LoadedContent {
  readonly contentIndex: ContentIndex;
  readonly contentPackVersion: string;
}

// A function, not a module-level singleton, so tests and the debug panel build their own.
export const loadContentIndex = (): LoadedContent => ({
  contentIndex: createContentIndex(contentPack),
  contentPackVersion,
});
