import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // `catch (_) {}` is the intentional best-effort pattern for
      // localStorage / audio calls throughout this codebase
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none', varsIgnorePattern: '^_' }],
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    // Vercel serverless functions run in Node
    files: ['api/**/*.js'],
    languageOptions: { globals: globals.node },
  },
])
