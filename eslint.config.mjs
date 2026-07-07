const rules = {
  'eqeqeq': 'error',
  'no-undef': 'error',
  'no-unused-vars': 'error',
  'no-var': 'error',
  'prefer-const': 'error',
};

export default [
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        chrome: 'readonly',
        document: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
      },
    },
    rules,
  },
  {
    files: ['test/**/*.mjs'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        global: 'writable',
        setTimeout: 'readonly',
      },
    },
    rules,
  },
];
