/**
 * Smartsend API Test Runner
 *
 * Usage:
 *   node runTests.js                    # Run all tests
 *   node runTests.js smoke              # Smoke tests only
 *   node runTests.js regression         # Regression tests
 *   node runTests.js critical           # Critical path tests
 *   node runTests.js user-management    # User management domain
 *   node runTests.js business-core      # Business core domain
 *
 * Tags are mapped to file patterns: tests/<tag>/*.test.js
 * Falls back to treating the argument as a test path pattern.
 */

const { execSync } = require('child_process');

const tagPatterns = {
  'smoke': 'tests/smoke',
  'regression': 'tests/regression',
  'critical': 'tests/critical',
  'user-management': 'tests/regression/user*',
  'business-core': 'tests/(regression|critical)/shipment*'
};

const tag = process.argv[2];

if (!tag) {
  console.log('Running all tests...');
  execSync('npx jest --runInBand --detectOpenHandles', { stdio: 'inherit' });
  process.exit(0);
}

const pattern = tagPatterns[tag];

if (pattern) {
  const testMatch = pattern.includes('*') ? pattern : `${pattern}/**/*.test.js`;
  console.log(`Running ${tag} tests (${testMatch})...`);
  execSync(`npx jest --runInBand --detectOpenHandles "${testMatch}"`, { stdio: 'inherit' });
} else {
  console.log(`Running tests matching: ${tag}`);
  execSync(`npx jest --runInBand --detectOpenHandles "${tag}"`, { stdio: 'inherit' });
}
