/*eslint-env node*/
module.exports = {
  extends: ['plugin:prettier/recommended', 'prettier/react'],

  globals: {
    require: false,
    expect: false,
    sinon: false,
    MockApiClient: true,
    TestStubs: true,
    tick: true,
    jest: true,
  },

  rules: {
    eqeqeq: 'off', // TODO: Enable again
  },

  plugins: ['import', 'prettier', 'react', 'jest'],

  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
      modules: true,
      legacyDecorators: true,
    },
  },

  env: {
    browser: true,
    es6: true,
    jest: true,
    jquery: true, // hard-loaded into vendor.js
  },

  settings: {
    'import/resolver': 'webpack',
    'import/extensions': ['.js', '.jsx'],
  },

  parser: 'babel-eslint',
};
