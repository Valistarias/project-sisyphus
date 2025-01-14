/* eslint-disable @typescript-eslint/no-unsafe-member-access
  -- For eslint purposes, specifically the hooks element
  */

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import love from 'eslint-config-love';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.{mjs,js,ts,jsx,tsx}'],
    ignores: [
      'node_modules',
      'dist',
      'vite-env.d.ts',
      'eslint.config.mjs'
    ]
  },
  { languageOptions: { globals: {
    ...globals.browser, ...globals.node
  } } },
  js.configs.recommended,
  tseslint.configs.recommended,
  love,
  stylistic.configs['recommended-flat'],
  pluginReact.configs.flat?.recommended,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules }
  },
  { rules: {
    'no-console': ['error', { allow: ['warn', 'error'] }],
    'max-lines': 'off',
    'max-nested-callbacks': 'off',
    'promise/avoid-new': 'off',
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
          'type'
        ],
        pathGroups: [
          {
            pattern: 'react',
            group: 'builtin',
            position: 'before'
          },
          {
            pattern: '@(express|mongoose|socket.io-client)',
            group: 'builtin',
            position: 'before'
          },
          {
            pattern: '{.,..,../..,../../..}/providers',
            group: 'external',
            position: 'after'
          },
          {
            pattern: '{.,..,../..,../../..}/pages',
            group: 'internal',
            position: 'before'
          },
          {
            pattern: '{.,..,../..,../../..}/interfaces',
            group: 'object',
            position: 'after'
          },
          {
            pattern: '{.,..,../..,../../..}/utils',
            group: 'object',
            position: 'after'
          }
        ],
        pathGroupsExcludedImportTypes: ['react'],
        distinctGroup: true,
        alphabetize: {
          order: 'asc',
          caseInsensitive: true
        }
      }
    ],
    complexity: 'off',
    'init-declarations': 'off',
    '@typescript-eslint/init-declarations': 'off',
    '@typescript-eslint/no-base-to-string': 'off',
    'no-magic-numbers': 'off',
    '@typescript-eslint/prefer-promise-reject-errors': 'off',
    '@typescript-eslint/no-magic-numbers': 'off',
    '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
    'prefer-destructuring': 'off',
    '@typescript-eslint/prefer-destructuring': [
      'error',
      { object: true },
      { enforceForRenamedProperties: false }
    ],
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@stylistic/padding-line-between-statements': [
      'error',
      {
        blankLine: 'always', prev: '*', next: 'return'
      }
    ],
    '@stylistic/semi': ['error', 'always'],
    '@stylistic/quote-props': ['error', 'as-needed'],
    '@stylistic/comma-dangle': ['error', 'never'],
    '@stylistic/brace-style': ['error', '1tbs'],
    '@stylistic/max-len': [
      'error',
      {
        code: 80, ignoreComments: true
      }
    ],
    '@stylistic/array-element-newline': [
      'error',
      {
        consistent: true, multiline: true, minItems: 3
      }
    ]
  } }
);
