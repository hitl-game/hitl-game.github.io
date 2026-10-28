const authoringFields: ReadonlySet<string> = new Set(['kernel', 'translatorNote', 'status']);

// Writer-facing fields never reach the pack, so they never change contentPackVersion (CNT-05).
// Only the item's top level: a nested `status` (an event's AllGreen status) is shipped data.
export function stripAuthoringMetadata(item: unknown): unknown {
  if (typeof item !== 'object' || item === null || Array.isArray(item)) return item;
  return Object.fromEntries(Object.entries(item).filter(([key]) => !authoringFields.has(key)));
}
