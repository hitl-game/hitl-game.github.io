import { canonicalize } from './canonicalize';
import { fingerprint } from './fingerprint';

export const applyCommand = (value: string): string => fingerprint(canonicalize(value));
