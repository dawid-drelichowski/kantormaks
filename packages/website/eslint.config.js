import css from '@eslint/css'
import globals from 'globals'
import baseConfig from '../../eslint.config.js'

export default [
  ...baseConfig,
  {
    files: ['assets/js/**/*.js'],
    languageOptions: {
      globals: globals.browser,
    },
  },
  {
    files: ['assets/*.css'],
    plugins: {
      css,
    },
    language: 'css/css',
    rules: {
      ...css.configs.recommended.rules,
      'css/no-invalid-properties': 'off',
    },
  },
]
