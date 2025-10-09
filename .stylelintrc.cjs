module.exports = {
  extends: [
    'stylelint-config-standard'
  ],
  rules: {
    'color-function-notation': 'modern',
    'selector-class-pattern': null,
    'no-descending-specificity': null,
    'property-no-vendor-prefix': null
  },
  ignoreFiles: [
    'dist/**/*',
    'node_modules/**/*'
  ]
};

