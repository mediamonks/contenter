module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    '@mediamonks',
    'plugin:vue/vue3-recommended',
    '@vue/airbnb',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'max-len': ['off'],
    'object-curly-newline': ['off'],
    'implicit-arrow-linebreak': ['off'],
    'operator-linebreak': ['off'],
    'import/prefer-default-export': 'off',
  },
};
