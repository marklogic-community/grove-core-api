module.exports = {
  root: true,
  env: {
    node: true,
    es6: true
  },
  extends: [
    'plugin:prettier/recommended',
    'eslint:recommended',
    'plugin:node/recommended'
  ],
  rules: {
    'no-console': 'off',
    'no-unused-vars': [
      'error',
      {
        argsIgnorePattern: 'next'
      }
    ]
  }
};
