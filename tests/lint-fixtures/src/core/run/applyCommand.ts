import { fingerprint } from './fingerprint';

export const applyCommand = (value: string): string => fingerprint(value);
