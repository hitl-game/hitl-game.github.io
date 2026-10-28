import { sha256Hex } from '../../shared';

export const hashState = (value: string): string => sha256Hex(value);
