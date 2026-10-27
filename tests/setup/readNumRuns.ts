const defaultNumRuns = 100;

export function readNumRuns(rawValue: string | undefined): number {
  if (rawValue === undefined || rawValue.trim() === '') return defaultNumRuns;
  const numRuns = Number(rawValue);
  if (!Number.isSafeInteger(numRuns) || numRuns <= 0) {
    throw new Error(`FC_NUM_RUNS must be a positive integer, got "${rawValue}"`);
  }
  return numRuns;
}
