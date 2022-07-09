/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['svelte3', '@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    project: ['./packages/*/tsconfig.json'],
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  env: { browser: true, es2017: true, node: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:@typescript-eslint/strict',
    'plugin:unicorn/recommended',
    'xo-typescript',
    'prettier',
  ],
  overrides: [{ files: ['*.svelte'], processor: 'svelte3/svelte3' }],
  settings: { 'svelte3/typescript': () => require('typescript') },
  rules: {
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    'no-empty-pattern': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/prevent-abbreviations': 'off',
  },
}
