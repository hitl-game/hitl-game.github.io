const tokenOnlyProperties = [
  '/color$/',
  'fill',
  'stroke',
  'background',
  'border-color',
  'outline-color',
  'box-shadow',
  '/^margin/',
  '/^padding/',
  '/gap$/',
  'text-shadow',
  '/^inset/',
  'top',
  'right',
  'bottom',
  'left',
  'font-family',
  'font-size',
  'font-weight',
  'line-height',
];

const varFallback = '/var\\(\\s*--[^,)]+,/';
// Any value that is not a list of var() tokens; stops raw values hiding in local custom properties.
const notTokensOnly = '/^(?!(\\s*var\\(--[a-z0-9-]+\\)[\\s,/]*)+$)/';
const rawValueMessage = 'Use design tokens: var(--token), without a fallback.';

// The theme is where raw values become tokens, and where @font-face lives.
const themeFiles = ['src/ui/theme/**/*.css', 'tests/lint-fixtures/css/src/ui/theme/**/*.css'];

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'declaration-no-important': true,
    // expandShorthand cannot parse `font: 14px/1.4 serif`, so `font` must be tokens only.
    'declaration-property-value-allowed-list': {
      font: ['/^(inherit|initial|unset|(var\\(--[a-z0-9-]+\\)(\\s*\\/\\s*|\\s+)?)+)$/'],
    },
    'declaration-property-value-disallowed-list': [
      { '/.*/': [varFallback], '/^--/': [notTokensOnly] },
      { message: rawValueMessage },
    ],
    'selector-class-pattern': [
      '^[a-z][a-zA-Z0-9]*$',
      { message: 'CSS Module classes are camelCase; state goes in data- attributes.' },
    ],
    'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
    'property-no-unknown': [true, { ignoreProperties: ['composes'] }],
    'scale-unlimited/declaration-strict-value': [
      tokenOnlyProperties,
      {
        // Off so raw values cannot hide inside rgb(), calc() and friends.
        ignoreFunctions: false,
        // Checks the longhands inside `border`, `font`, `outline`… against the list above.
        expandShorthand: true,
        ignoreValues: [
          '0',
          'inherit',
          'currentcolor',
          'transparent',
          'auto',
          'none',
          'initial',
          'unset',
          // The plugin splits lists on spaces, so each item of `var(--a), var(--b)` keeps its comma.
          '/^var\\(--[a-z0-9-]+\\),$/',
        ],
      },
    ],
  },
  overrides: [
    {
      files: themeFiles,
      rules: {
        'scale-unlimited/declaration-strict-value': null,
        'declaration-property-value-disallowed-list': [
          { '/.*/': [varFallback] },
          { message: rawValueMessage },
        ],
      },
    },
  ],
};
