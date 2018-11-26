/* eslint-env node */

module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testMatch: [
    '**/tests/**/*.spec.(js)|**/__tests__/**/*.(js)'
  ]
};
