// eslint.config.mjs
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

/** @type {import("eslint").Linter.FlatConfig[]} */
export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,

  prettier,

  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },

    parserOptions: {
      project: './tsconfig.eslint.json',
      tsconfigRootDir: new URL('.', import.meta.url).pathname,
    },
  },

  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
);
