const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([expo, { ignores: ['dist/*', 'artifacts/*', '.expo/*', '.secrets/*', 'supabase/functions/**'] }, {
  files: ['src/**/*.ts', 'src/**/*.tsx'],
  rules: { 'no-restricted-imports': ['error', {
    paths: ['pg'], patterns: ['node:*', '**/.secrets/**', '**/server/**', '**/scripts/**'],
  }] },
}]);
