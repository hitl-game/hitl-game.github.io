import { coreValue } from '../core';
import { advance } from '../core/run';
import { platformValue } from '../platform';
import { sharedValue } from '../shared';

export const appLabel = `${coreValue}-${platformValue}-${sharedValue}-${String(advance(0))}`;
