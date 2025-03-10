module.exports = {
  extends: 'next/core-web-vitals',
  rules: {
    // Disable rules that might interfere with our production build
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': 'warn',
    'react/no-unescaped-entities': 'off'
  }
} 