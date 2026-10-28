export const floorCents = (cents: number, parts: number): number => Math.floor(cents / parts);
export const ceilCents = (cents: number, parts: number): number => Math.ceil(cents / parts);
export const truncCents = (cents: number, parts: number): number => Math.trunc(cents / parts);
export const precise = (cents: number, digits: number): string => cents.toPrecision(digits);
export const exponential = (cents: number, digits: number): string => cents.toExponential(digits);
