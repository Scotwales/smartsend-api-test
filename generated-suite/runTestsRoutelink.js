const { spawnSync } = require('child_process');
const path = require('path');

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const { testSuites, testGroups } = require('./test.config.routelink');

const target = process.argv[2] || 'all';
const suiteTarget = target === 'routelink'
  ? 'all'
  : target.startsWith('routelink:')
    ? target.split(':')[1]
    : target;

function getTestPattern(testTarget) {
  if (testTarget === 'all') {
    return Object.keys(testSuites).map(key => testSuites[key].runner);
  }

  if (testGroups[testTarget]) {
    return testGroups[testTarget].suites.map(key => testSuites[key].runner);
  }

  if (testSuites[testTarget]) {
    return [testSuites[testTarget].runner];
  }

  if (isCI) {
    console.error(`::error::Unknown test target: ${target}`);
  } else {
    console.error(`Unknown target: ${target}`);
  }
  process.exit(1);
}

const patterns = getTestPattern(suiteTarget);
const jestBin = require.resolve('jest/bin/jest');
const result = spawnSync(process.execPath, [
  jestBin,
  ...patterns,
  ...process.argv.slice(3),
  '--runInBand',
  '--config',
  path.join(__dirname, 'jest.config.routelink.js')
], {
  stdio: 'inherit',
  env: {
    ...process.env,
    FORCE_COLOR: isCI ? '0' : '1',
    CI: isCI ? 'true' : process.env.CI
  }
});

if (result.error) {
  console.error(`Unable to start Jest: ${result.error.message}`);
  process.exit(1);
}

process.exitCode = result.status === null ? 1 : result.status;
