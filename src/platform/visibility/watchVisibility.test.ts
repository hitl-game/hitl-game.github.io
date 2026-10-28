import { afterEach, describe, expect, it } from 'vitest';

import { isDocumentVisible, watchVisibility } from './watchVisibility';

function setVisibilityState(state: DocumentVisibilityState): void {
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: state });
  document.dispatchEvent(new Event('visibilitychange'));
}

describe('watchVisibility', () => {
  afterEach(() => {
    setVisibilityState('visible');
  });

  it('reads whether the document is visible', () => {
    setVisibilityState('hidden');
    expect(isDocumentVisible()).toBe(false);

    setVisibilityState('visible');
    expect(isDocumentVisible()).toBe(true);
  });

  it('reports each visibilitychange with the new visibility', () => {
    const seen: boolean[] = [];
    const unwatch = watchVisibility((isVisible) => seen.push(isVisible));

    setVisibilityState('hidden');
    setVisibilityState('visible');
    unwatch();

    expect(seen).toEqual([false, true]);
  });

  it('stops reporting once the returned function is called', () => {
    const seen: boolean[] = [];
    const unwatch = watchVisibility((isVisible) => seen.push(isVisible));

    unwatch();
    setVisibilityState('hidden');

    expect(seen).toEqual([]);
  });
});
