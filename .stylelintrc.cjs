module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  rules: {
    'color-function-notation': 'modern',
    'declaration-block-single-line-max-declarations': null,
    'keyframes-name-pattern': '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^[a-z][A-Za-z0-9]*$',
    'no-duplicate-selectors': null,
    'selector-class-pattern': null,
    'selector-id-pattern': '^([a-z][a-z0-9]*)(-[a-z0-9]+)*$|^[a-z][A-Za-z0-9]*$',
    'no-descending-specificity': null,
    'property-no-vendor-prefix': null
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*'
  ]
};
