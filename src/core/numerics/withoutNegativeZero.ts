// IEEE 754 keeps a sign on zero (`0 * -1`, `-(a - a)`), and `-0 === 0`, so it slips past
// every range check; canonicalize rejects it. Values entering the state go through here.
export const withoutNegativeZero = (value: number): number => (value === 0 ? 0 : value);
