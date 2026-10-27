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
  'gap',
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

export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-declaration-strict-value'],
  rules: {
    'declaration-no-important': true,
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
        ignoreValues: [
          '0',
          'inherit',
          'currentcolor',
          'transparent',
          'auto',
          'none',
          'initial',
          'unset',
        ],
      },
    ],
  },
};
