import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
        ...globals.node,
      },
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          impliedStrict: true,
        },
      },
    },
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'off', // Allow console statements for now
      'prefer-const': 'warn', // Reduce to warning
      'no-var': 'error',
      'no-prototype-builtins': 'warn', // Reduce to warning
      'no-case-declarations': 'warn', // Reduce to warning
      'no-undef': 'error',
    },
  },
  {
    // Special config for Vite config files
    files: ['vite.config.js', '*.config.js'],
    languageOptions: {
      globals: {
        ...globals.node,
        __dirname: 'readonly',
        __filename: 'readonly',
      },
    },
  },
  {
    ignores: ['dist/', 'node_modules/'],
  },
];
