import js from '@eslint/js';
import love from 'eslint-config-love';
import eslintConfigPrettier from 'eslint-config-prettier';
import pluginReact from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'],
    ignores: ['node_modules', 'dist', 'vite-env.d.ts'],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  tseslint.configs.recommended,
  love,
  pluginReact.configs.flat?.recommended,
  pluginReact.configs.flat?.['jsx-runtime'],
  eslintConfigPrettier,
  {
    rules: {
      'no-console': ['error', { allow: ['warn', 'error'] }],
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
      'no-magic-numbers': 'off',
      '@typescript-eslint/no-magic-numbers': 'off',
      'prefer-destructuring': 'off',
      '@typescript-eslint/prefer-destructuring': 'error',
    },
  }
);
