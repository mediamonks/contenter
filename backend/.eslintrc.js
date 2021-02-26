module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: ['@mediamonks'],
  parserOptions: {
    ecmaVersion: 2020,
  },
  ignorePatterns: [
    '/dist/**/*', // Ignore built files.
    '/node_modules/**/*',
  ],
};
