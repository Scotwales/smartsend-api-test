const { execSync } = require('child_process');

const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

const { testSuites, testGroups } = require('./test.config.smartsend');

const target = process.argv[2] || 'all';
const jestArgs = process.argv.slice(3).join(' ');

const moduleTarget = target === 'smartsend' ? 'all' : (target.startsWith('smartsend:') ? target.split(':')[1] : target);

function getTestPattern(target) {
  if (target === 'all') {
    const allPatterns = Object.keys(testSuites).map(key => testSuites[key].runner);
    return allPatterns.join(' ');
  }

  if (testGroups[target]) {
    const patterns = testGroups[target].suites.map(key => testSuites[key].runner);
    return patterns.join(' ');
  }

  if (testSuites[target]) {
    return testSuites[target].runner;
  }

  if (isCI) {
    console.error(`::error::Unknown test target: ${target}`);
  } else {
    console.error(`Unknown target: ${target}`);
  }
  process.exit(1);
}

const pattern = getTestPattern(moduleTarget);
const jestConfig = '--config jest.config.smartsend.js';
const command = `npx jest ${pattern} --runInBand ${jestConfig} ${jestArgs}`.trim();

if (isCI) {
  console.log(`::group::Running Smartsend API tests [${target}]`);
  console.log(`Target: ${target}`);
  console.log(`Pattern: ${pattern}`);
  console.log(`::group::`);
}

try {
  execSync(command, {
    stdio: 'inherit',
    env: {
      ...process.env,
      FORCE_COLOR: isCI ? '0' : '1',
      CI: isCI ? 'true' : process.env.CI,
      JEST_HTML_REPORTERS_OUTPUT_NAME: isCI
        ? `smartsend-api-tests-ci-report-${target}.html`
        : undefined,
    }
  });
  if (isCI) {
    console.log(`::notice::Smartsend API tests [${target}] completed successfully`);
  }
  process.exit(0);
} catch (error) {
  if (isCI) {
    console.error(`::error::Smartsend API tests [${target}] failed`);
  }
  process.exit(1);
}
