const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

module.exports = {
  setupFiles: [
    '<rootDir>/jest.setup.js'
  ],
  testMatch: [
    '**/*.test.js'
  ],
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  testTimeout: isCI ? 600000 : 300000,
  maxWorkers: 1,
  reporters: [
    'default'
  ],
  coverageDirectory: isCI ? './reports/ci/coverage-compliance' : './reports/coverage-compliance',
  coverageReporters: [
    'text',
    'lcov',
    'html'
  ],
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!**/reports/**',
    '!**/coverage/**'
  ],
  moduleFileExtensions: [
    'js',
    'json',
    'node'
  ],
  watchPathIgnorePatterns: [
    '/node_modules/',
    '/reports/'
  ]
};
