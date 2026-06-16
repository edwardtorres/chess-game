import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // Build output and the vendored Stockfish engine are not our source.
  globalIgnores(['dist', 'public/stockfish']),
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
      // We intentionally keep the chess.js game instance in a ref and read it
      // during render (bumping a version counter to re-render). That is a valid,
      // well-known pattern for wrapping a mutable library, so these two strict
      // rules don't apply here.
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
      // These are React Compiler memoization checks. We don't use the compiler,
      // and we follow the convention of omitting stable setState setters from
      // dependency arrays, which this rule flags.
      'react-hooks/preserve-manual-memoization': 'off',
    },
  },
])
