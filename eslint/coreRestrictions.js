// What src/core may not touch (core purity, D2 and DET-08); eslint.config.js applies it.

export const coreRestrictedGlobals = [
  'Date',
  'performance',
  'setTimeout',
  'setInterval',
  'setImmediate',
  'requestAnimationFrame',
  'queueMicrotask',
  'crypto',
  'fetch',
  'console',
  'window',
  'document',
  'navigator',
  'localStorage',
  'sessionStorage',
  'indexedDB',
  'XMLHttpRequest',
  'WebSocket',
  'Worker',
  'AudioContext',
  'Notification',
  'caches',
  'location',
  'process',
  'self',
  'globalThis',
  'Intl',
].map((name) => ({
  name,
  message: 'core/ is pure: time, randomness and I/O arrive as arguments.',
}));

const roundingMessage = 'Divide through core/numerics divideRounded, the only rounding path.';
const localeMessage = 'Locale-dependent results break cross-engine determinism (DET-08).';
export const coreRestrictedProperties = [
  { object: 'Math', property: 'random', message: 'Use the subsystem RngStream.' },
  ...['round', 'floor', 'ceil', 'trunc'].map((property) => ({
    object: 'Math',
    property,
    message: roundingMessage,
  })),
  ...['toFixed', 'toPrecision', 'toExponential'].map((property) => ({
    property,
    message: roundingMessage,
  })),
  { property: 'localeCompare', message: localeMessage },
  { property: 'toLocaleString', message: localeMessage },
  { property: 'toLocaleLowerCase', message: localeMessage },
  { property: 'toLocaleUpperCase', message: localeMessage },
];

export const coreRestrictedImports = {
  paths: ['preact', '@preact/signals', 'idb'],
  patterns: [
    { group: ['preact/*', 'node:*'], message: 'core/ imports only shared/ and pure libraries.' },
    {
      group: ['virtual:*'],
      message: 'core/ receives content as an argument (ContentIndex), never from a virtual module.',
    },
  ],
};
