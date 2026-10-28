export function assertInvariant(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`Invariant violated: ${message}`);
}
