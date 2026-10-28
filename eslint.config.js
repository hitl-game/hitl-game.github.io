import comments from '@eslint-community/eslint-plugin-eslint-comments';
import boundaries from 'eslint-plugin-boundaries';
import sonarjs from 'eslint-plugin-sonarjs';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

// The lint fixtures mirror src/ so the same scoped rules apply to them.
const inSrc = (glob) => [`src/${glob}`, `tests/lint-fixtures/src/${glob}`];

const layerImports = {
  core: ['shared'],
  platform: ['shared'],
  app: ['core', 'platform', 'i18n', 'shared'],
  ui: ['app', 'i18n', 'shared'],
  report: ['core', 'shared'],
  i18n: ['shared'],
  shared: [],
  debug: ['app'],
  // Story 8.1 PDF spike page only; Story 6.5 removes the layer with the page.
  spike: ['report'],
};

const publicApi = 'index.{ts,tsx}';

// First match wins, so `main` only catches the files left directly under src/.
const boundaryElements = [
  { type: 'uiFeature', pattern: 'src/ui/features/*', capture: ['feature'] },
  { type: 'module', pattern: 'src/*/*', capture: ['layer', 'module'] },
  { type: 'layer', pattern: 'src/*', capture: ['layer'] },
  { type: 'main', pattern: 'src' },
];

const toLayerApi = (layers) => ({
  element: { type: ['layer', 'module'], captured: { layer: layers }, fileInternalPath: publicApi },
});

const boundaryPolicies = [
  { allow: { dependency: { relationship: { to: 'internal' } } } },
  {
    from: { element: { type: ['layer', 'module'] } },
    allow: {
      to: [
        { element: { type: 'layer', captured: { layer: '{{from.element.captured.layer}}' } } },
        toLayerApi(['{{from.element.captured.layer}}']),
      ],
    },
  },
  ...Object.entries(layerImports)
    .filter(([, allowed]) => allowed.length > 0)
    .map(([layer, allowed]) => ({
      from: { element: { type: ['layer', 'module'], captured: { layer } } },
      allow: { to: toLayerApi(allowed) },
    })),
  {
    from: { element: { type: ['layer', 'module'], captured: { layer: 'ui' } } },
    allow: { to: { element: { type: 'uiFeature', fileInternalPath: publicApi } } },
  },
  {
    from: { element: { type: 'uiFeature' } },
    allow: { to: toLayerApi(['ui', ...layerImports.ui]) },
  },
  { from: { element: { type: 'main' } }, allow: { to: toLayerApi(['ui', 'app']) } },
];

const noDefaultExport = [
  { selector: 'ExportDefaultDeclaration', message: 'Use named exports only.' },
  {
    selector: "ExportNamedDeclaration > ExportSpecifier[exported.name='default']",
    message: 'Use named exports only.',
  },
];

const userFacingAttribute =
  'JSXAttribute[name.name=/^(aria-(label|description|valuetext|roledescription|placeholder)|title|alt|placeholder|label)$/]';
const textLiteral =
  ':matches(Literal[value=/\\S/], TemplateLiteral:has(TemplateElement[value.raw=/\\S/]))';
const textContainers = [
  ':matches(JSXElement, JSXFragment) > JSXExpressionContainer',
  `${userFacingAttribute} > JSXExpressionContainer`,
];

const textWrapper = `:matches(${[
  'ConditionalExpression',
  'LogicalExpression',
  "BinaryExpression[operator='+']",
  'TSAsExpression',
  'TSSatisfiesExpression',
  'ArrayExpression',
].join(', ')})`;
const maxWrapperDepth = 4;

// Only unbroken wrapper chains count, so a call such as t('area.' + name) stays allowed.
const wrapperChains = Array.from({ length: maxWrapperDepth + 1 }, (_, depth) =>
  Array.from({ length: depth }, () => `${textWrapper} > `).join(''),
);

const userFacingTextSelectors = [
  'JSXText[value=/\\S/]',
  `${userFacingAttribute} > Literal`,
  ...textContainers.flatMap((container) =>
    wrapperChains.map((chain) => `${container} > ${chain}${textLiteral}`),
  ),
];

const jsxRestrictions = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Render content text through ui/patterns/RichText, never as HTML.',
  },
  ...userFacingTextSelectors.map((selector) => ({
    selector,
    message: 'Use t() for user-facing strings.',
  })),
];

const coreRestrictedGlobals = [
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
const coreRestrictedProperties = [
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

const coreRestrictedImports = {
  paths: ['preact', '@preact/signals', 'idb'],
  patterns: [
    { group: ['preact/*', 'node:*'], message: 'core/ imports only shared/ and pure libraries.' },
  ],
};

// Fingerprinting and full state walks are never on a hot path (D4): advance (core/time) and
// applyCommand stay out of fingerprint, its parts (canonicalize, sha256Hex) and the full-walk
// entry points, and core/time never depends on core/run (no import cycle).
const hotPathMessage =
  'Hot paths never fingerprint or walk the whole state; core/time never imports core/run.';
const hotPathRestrictedImports = {
  paths: [
    ...coreRestrictedImports.paths,
    ...['.', './index', '..', '../index'].map((name) => ({ name, message: hotPathMessage })),
    { name: '../../shared', importNames: ['sha256Hex'], message: hotPathMessage },
  ],
  patterns: [
    ...coreRestrictedImports.patterns,
    {
      group: [
        '**/run',
        '**/run/*',
        '**/fingerprint',
        '**/canonicalize',
        '**/assertStateIsValid',
        '**/newRun',
        '**/replay',
        '**/core',
        '**/core/index',
      ],
      message: hotPathMessage,
    },
  ],
};

const configFilesWithDefaultExport = [
  'vite.config.ts',
  'vitest.config.ts',
  'playwright.config.ts',
  'eslint.config.js',
  'stylelint.config.js',
  'lint-staged.config.js',
];

export default defineConfig(
  {
    ignores: [
      'dist',
      'coverage',
      'playwright-report',
      'test-results',
      'blob-report',
      '_bmad',
      '_bmad-output',
      '.claude',
      '.agents',
      'tests/lint-fixtures',
    ],
  },
  { linterOptions: { reportUnusedDisableDirectives: 'error' } },
  tseslint.configs.strictTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: { allowDefaultProject: ['*.js'] },
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: { '@eslint-community/eslint-comments': comments, sonarjs },
    rules: {
      'no-console': 'error',
      'no-warning-comments': [
        'error',
        { terms: ['todo', 'fixme', 'xxx', 'hack'], location: 'anywhere' },
      ],
      '@eslint-community/eslint-comments/require-description': 'error',
      'sonarjs/no-commented-code': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/ban-ts-comment': [
        'error',
        { 'ts-expect-error': 'allow-with-description', 'ts-ignore': true, 'ts-nocheck': true },
      ],
      '@typescript-eslint/no-floating-promises': 'error',
      'max-lines-per-function': ['error', { max: 40, skipBlankLines: true, skipComments: true }],
      'max-lines': ['error', { max: 300, skipBlankLines: true, skipComments: true }],
      complexity: ['error', 10],
      'max-params': ['error', 3],
      'max-depth': ['error', 3],
      'no-nested-ternary': 'error',
      'no-restricted-syntax': ['error', ...noDefaultExport, ...jsxRestrictions],
    },
  },
  {
    files: configFilesWithDefaultExport,
    rules: { 'no-restricted-syntax': ['error', ...jsxRestrictions] },
  },
  {
    files: ['**/*.js'],
    extends: [tseslint.configs.disableTypeChecked],
  },
  {
    files: inSrc('**/*.{ts,tsx}'),
    plugins: { boundaries },
    settings: {
      'import/resolver': { typescript: { alwaysTryTypes: true } },
      'boundaries/elements': boundaryElements,
      'boundaries/legacy-templates': false,
    },
    rules: {
      'boundaries/dependencies': ['error', { default: 'disallow', policies: boundaryPolicies }],
    },
  },
  {
    files: inSrc('core/**/*.{ts,tsx}'),
    rules: {
      'no-restricted-globals': ['error', ...coreRestrictedGlobals],
      'no-restricted-properties': ['error', ...coreRestrictedProperties],
      'no-restricted-imports': ['error', coreRestrictedImports],
      'no-restricted-syntax': [
        'error',
        ...noDefaultExport,
        ...jsxRestrictions,
        { selector: 'ImportExpression', message: 'core/ is synchronous: no dynamic import().' },
      ],
      '@typescript-eslint/no-magic-numbers': [
        'error',
        {
          ignore: [0, 1],
          ignoreEnums: true,
          ignoreReadonlyClassProperties: true,
          ignoreTypeIndexes: true,
        },
      ],
    },
  },
  {
    files: inSrc('core/constants.ts'),
    rules: { '@typescript-eslint/no-magic-numbers': 'off' },
  },
  {
    files: [...inSrc('core/time/**/*.ts'), ...inSrc('core/run/applyCommand.ts')],
    ignores: ['**/*.test.ts'],
    rules: { 'no-restricted-imports': ['error', hotPathRestrictedImports] },
  },
  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ignores: ['tests/lint-fixtures/**'],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
);
