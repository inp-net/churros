/** @type {import('eslint').Linter.Config} */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2020,
    project: ['./packages/*/tsconfig.json'],
    sourceType: 'module',
    // To enable all rules in svelte files:
    extraFileExtensions: ['.svelte'],
  },
  env: { browser: true, es2017: true, node: true },
  globals: {
    $$Generic: 'readonly', // see https://github.com/sveltejs/svelte-eslint-parser/issues/306
    App: 'readonly',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/strict',
    'plugin:unicorn/recommended',
    'plugin:svelte/recommended',
    'prettier',
  ],
  settings: { 'svelte/typescript': () => require('typescript') },
  rules: {
    'no-warning-comments': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/consistent-type-definitions': 'off',
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/prefer-nullish-coalescing': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_',
      },
    ],
    'capitalized-comments': 'off',
    'curly': ['error', 'multi-or-nest', 'consistent'],
    'new-cap': 'off',
    'no-await-in-loop': 'off',
    'no-empty-pattern': 'off',
    'no-empty': 'warn',
    'prefer-const': 'warn',
    'unicorn/consistent-function-scoping': ['error', { checkArrowFunctions: false }],
    'unicorn/expiring-todo-comments': 'off',
    'unicorn/no-abusive-eslint-disable': 'off',
    'unicorn/no-document-cookie': 'off',
    'unicorn/prefer-top-level-await': 'off',
    'unicorn/prevent-abbreviations': 'off',
    'unicorn/no-empty-file': 'warn',
    'unicorn/prefer-spread': process.argv.includes('--fix') ? 'off' : 'warn',
  },
  overrides: [
    {
      files: ['*.ts'],
      excludedFiles: ['packages/api/scripts/*'],
      rules: {
        'no-console': [
          'error',
          {
            allow: ['warn', 'error', 'info', 'group', 'groupEnd'],
          },
        ],
      },
    },
    {
      files: ['*.svelte'],
      parser: 'svelte-eslint-parser',
      parserOptions: {
        parser: '@typescript-eslint/parser',
      },
      rules: {
        '@typescript-eslint/no-unnecessary-condition': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        'no-undef-init': 'off',
        'unicorn/consistent-destructuring': 'off',
        'unicorn/no-useless-undefined': 'off',
        'unicorn/filename-case': 'off',
        'no-console': [
          'error',
          {
            allow: ['warn', 'error', 'info', 'group', 'groupEnd'],
          },
        ],
      },
    },
  ],
};
