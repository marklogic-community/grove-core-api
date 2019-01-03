module.exports = {
  verbose: true,
  moduleFileExtensions: ['js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  globalSetup: '<rootDir>/tests/setup.js',
  globalTeardown: '<rootDir>/tests/teardown.js',
  testMatch: ['**/tests/**/*.spec.(js)|**/__tests__/**/*.(js)']
};
