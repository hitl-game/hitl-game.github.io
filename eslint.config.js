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

const jsxRestrictions = [
  {
    selector: "JSXAttribute[name.name='dangerouslySetInnerHTML']",
    message: 'Render content text through ui/patterns/RichText, never as HTML.',
  },
  { selector: 'JSXText[value=/\\S/]', message: 'Use t() for user-facing strings.' },
  {
    selector:
      'JSXAttribute[name.name=/^(aria-label|aria-description|title|alt|placeholder)$/] > Literal',
    message: 'Use t() for user-facing strings.',
  },
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
].map((name) => ({
  name,
  message: 'core/ is pure: time, randomness and I/O arrive as arguments.',
}));

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
      'no-restricted-properties': [
        'error',
        { object: 'Math', property: 'random', message: 'Use the subsystem RngStream.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: ['preact', '@preact/signals', 'idb'],
          patterns: ['preact/*'],
        },
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
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    ignores: ['tests/lint-fixtures/**'],
    rules: {
      'max-lines-per-function': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
    },
  },
);
