import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import love from 'eslint-config-love';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', 'vite-env.d.ts'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  js.configs.recommended,
  tseslint.configs.recommended,
  love,
  stylistic.configs['recommended-flat'],
  pluginReact.configs.flat.recommended,
  eslintConfigPrettier,
  {
    plugins: { 'react-hooks': reactHooks },
    rules: { ...reactHooks.configs.recommended.rules },
  },
  {
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'max-lines': 'off',
      'max-nested-callbacks': 'off',
      'promise/avoid-new': 'off',
      'import/order': [
        'error',
        {
          'newlines-between': 'always',
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          pathGroups: [
            {
              pattern: 'react',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '@(express|mongoose|socket.io-client)',
              group: 'builtin',
              position: 'before',
            },
            {
              pattern: '{.,..,../..,../../..}/providers',
              group: 'external',
              position: 'after',
            },
            {
              pattern: '{.,..,../..,../../..}/pages',
              group: 'internal',
              position: 'before',
            },
            {
              pattern: '{.,..,../..,../../..}/interfaces',
              group: 'object',
              position: 'after',
            },
            {
              pattern: '{.,..,../..,../../..}/utils',
              group: 'object',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['react'],
          distinctGroup: true,
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      complexity: 'off',
      'init-declarations': 'off',
      'no-magic-numbers': 'off',
      '@typescript-eslint/init-declarations': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      '@typescript-eslint/no-unsafe-type-assertion': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/prefer-promise-reject-errors': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      '@typescript-eslint/use-unknown-in-catch-callback-variable': 'off',
      'prefer-destructuring': 'off',
      '@typescript-eslint/prefer-destructuring': [
        'error',
        { object: true },
        { enforceForRenamedProperties: false },
      ],
      '@typescript-eslint/triple-slash-reference': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@stylistic/padding-line-between-statements': [
        'error',
        {
          blankLine: 'always',
          prev: '*',
          next: 'return',
        },
      ],
      '@stylistic/semi': 'off',
      '@stylistic/quote-props': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/brace-style': 'off',
      '@stylistic/max-len': 'off',
      '@stylistic/array-element-newline': 'off',
    },
  }
);
