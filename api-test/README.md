# API Integration Test Framework

A structured, scalable API integration testing framework built with **Jest** and **SuperTest**. This guide uses the Smartsend API test suite as the reference implementation.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Configuration Files](#configuration-files)
- [Test Architecture](#test-architecture)
- [Writing New Tests](#writing-new-tests)
- [Utilities](#utilities)
- [Running Tests](#running-tests)
- [Test Reports](#test-reports)
- [CI/CD Integration](#cicd-integration)
- [Conventions](#conventions)

---

## Prerequisites

- **Node.js** >= 18.x (check `.nvmrc` if present)
- **npm** >= 9.x
- Access to the target API (running locally or a deployed environment)

---

## Project Structure

```
project-root/
├── config/
│   └── config.js                  # Centralized configuration (reads from .env)
├── test-data/
│   ├── constants.js               # API endpoints, status codes, test tags
│   ├── EmailGenerator.js          # Random email/name generator
│   ├── PhoneNumberGenerator.js    # Random phone number generator
│   └── test-users.json            # Static test user fixtures (optional)
├── tests/
│   └── <suite-name>/              # One directory per test suite
│       ├── test-suite.config.js   # Defines test file execution order
│       ├── run-tests-in-order.test.js  # Ordered test runner (boilerplate)
│       ├── <feature>.test.js      # Individual test files
│       └── ...
├── utilities/
│   ├── apiClient.js               # SuperTest HTTP client wrapper
│   ├── createCustomer.js          # Test data factory (full onboarding flow)
│   ├── logger.js                  # Configurable leveled logger
│   └── testHeaders.js             # Common HTTP headers
├── reports/                       # Generated HTML/JUnit test reports
├── .env                           # Secrets (gitignored)
├── .env.example                   # Environment variable template
├── .gitignore
├── babel.config.js                # Babel transpilation config
├── config.js                      # (alias for config/config.js if preferred)
├── jest.config.js                 # Dedicated Jest config (CI-aware)
├── jest.setup.js                  # Jest setupFile (loads dotenv, sets timeout)
├── jest.globalSetup.js            # Jest globalSetup (optional auth bootstrap)
├── test.config.js                 # Suite registry + group definitions
├── runTests.js                    # Custom test runner (suite/group targeting)
├── package.json                   # Dependencies + npm scripts
└── README.md
```

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `config/` | Centralized configuration that reads environment variables |
| `test-data/` | Constants (endpoints, status codes), generators, and static fixtures |
| `tests/` | Test suites organized by feature/domain |
| `utilities/` | Shared helpers: HTTP client, data factories, logger |
| `reports/` | Generated test output (HTML, JUnit XML, coverage) |

---

## Setup Instructions

### 1. Initialize the Project

```bash
mkdir my-api-tests && cd my-api-tests
npm init -y
```

### 2. Install Dependencies

```bash
# Runtime dependencies
npm install dotenv supertest

# Dev dependencies
npm install --save-dev jest babel-jest @babel/core @babel/preset-env jest-html-reporters jest-junit @faker-js/faker chai
```

### 3. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with your API details:

```env
# Required
BASE_URL=https://your-api.example.com/v1

# Authentication (choose one method)
AUTH_TOKEN=your-bearer-token-here
# OR use bootstrap login:
# TEST_BOOTSTRAP_EMAIL=user@example.com
# TEST_BOOTSTRAP_PASSWORD=Password@2

# Test Data
TEST_PHONE=+447700900123
TEST_OTP_CODE=123456

# Retry Configuration
RETRY_ENABLED=true
RETRY_COUNT=2
RETRY_DELAY_MS=1000

# Debug
LOG_LEVEL=info
LOG_REQUEST_BODY=false
LOG_RESPONSE_BODY=false
```

### 4. Create Core Configuration Files

Create the following files (see [Configuration Files](#configuration-files) for details):

- `babel.config.js`
- `jest.config.js`
- `jest.setup.js`
- `config/config.js`
- `test.config.js`
- `runTests.js`

### 5. Add npm Scripts to `package.json`

```json
{
  "scripts": {
    "test": "node runTests.js",
    "test:ci": "node runTests.js all",
    "test:direct": "npx jest --runInBand --config jest.config.js"
  }
}
```

---

## Configuration Files

### `babel.config.js`

Transpiles modern JavaScript for the current Node.js version:

```js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ]
};
```

### `jest.config.js`

Dedicated Jest configuration with CI awareness:

```js
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';

module.exports = {
  setupFiles: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/*.test.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  testTimeout: isCI ? 600000 : 300000,
  maxWorkers: 1,
  reporters: [
    'default',
    [
      'jest-html-reporters',
      {
        publicPath: isCI ? './reports/ci' : './reports',
        filename: isCI ? 'test-report-ci.html' : 'test-report.html',
        pageTitle: 'API Test Report',
        expand: true,
        hideIcon: false,
        includeFailureMsg: true,
        includeConsoleLog: isCI,
        enableMergeData: true,
        dataMergeLevel: 1
      }
    ],
    ...(isCI ? [['jest-junit', {
      outputDirectory: './reports/ci',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' > ',
      usePathForSuiteName: true
    }]] : [])
  ],
  coverageDirectory: isCI ? './reports/ci/coverage' : './reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  collectCoverageFrom: [
    '**/*.js',
    '!**/*.test.js',
    '!**/node_modules/**',
    '!**/reports/**'
  ],
  transform: {
    '^.+\\.js$': 'babel-jest'
  },
  transformIgnorePatterns: [
    '/node_modules/(?!@faker-js/faker)'
  ],
  moduleFileExtensions: ['js', 'json', 'node'],
  watchPathIgnorePatterns: ['/node_modules/', '/reports/']
};
```

**Key settings explained:**

| Setting | Why |
|---------|-----|
| `maxWorkers: 1` | Tests run sequentially to respect data dependencies between tests |
| `testTimeout: 300000` | 5-minute timeout covers full customer onboarding + API chains |
| `transformIgnorePatterns` | Allows `@faker-js/faker` (ESM) to be transpiled by Babel |
| `isCI` branching | Different report paths and JUnit output for CI pipelines |

### `jest.setup.js`

Runs before all tests. Loads environment variables and sets global timeout:

```js
require('dotenv').config();

if (!process.env.BASE_URL) {
  console.warn(
    'BASE_URL is not set. Integration tests requiring a live API will be skipped.'
  );
}

jest.setTimeout(300000);
```

### `config/config.js`

Centralized configuration that reads from `process.env`:

```js
require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  baseUrl: (process.env.BASE_URL || 'https://default-api.example.com/v1').replace(/\/+$/, ''),
  authToken: process.env.AUTH_TOKEN || null,
  timeout: parseInt(process.env.TEST_TIMEOUT, 10) || 30000,
  retry: {
    count: parseInt(process.env.RETRY_COUNT, 10) || 2,
    delayMs: parseInt(process.env.RETRY_DELAY_MS, 10) || 1000,
    enabled: (process.env.RETRY_ENABLED || 'true') === 'true'
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logRequestBody: (process.env.LOG_REQUEST_BODY || 'false') === 'true',
    logResponseBody: (process.env.LOG_RESPONSE_BODY || 'false') === 'true'
  },
  isCi: process.env.CI === 'true',
  endpoints: {
    mobile: {
      phoneVerification: '/mobile/verification/phoneVerification',
      phoneOtpValidation: '/mobile/verification/phoneOtpValidation'
    }
  },
  getEndpoint(domain, action) {
    return this.endpoints[domain]?.[action];
  }
};

module.exports = config;
```

### `test.config.js`

Suite registry that maps suite names to runner files and defines groups:

```js
const testSuites = {
  'my-suite': {
    name: 'My Feature Suite',
    runner: 'tests/my-suite/run-tests-in-order.test.js',
    description: 'Description of what this suite tests',
    tags: ['tag1', 'tag2'],
  },
  // Add more suites...
};

const testGroups = {
  'all': {
    description: 'All test modules',
    suites: Object.keys(testSuites),
  },
  'smoke': {
    description: 'Quick smoke tests',
    suites: ['my-suite'],  // Add critical suites here
  },
  'regression': {
    description: 'Full regression suite',
    suites: Object.keys(testSuites),
  },
};

module.exports = { testSuites, testGroups };
```

### `runTests.js`

Custom test runner that supports suite/group targeting:

```js
const { execSync } = require('child_process');
const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
const { testSuites, testGroups } = require('./test.config');

const target = process.argv[2] || 'all';
const jestArgs = process.argv.slice(3).join(' ');

function getTestPattern(target) {
  if (target === 'all') {
    return Object.keys(testSuites).map(k => testSuites[k].runner).join(' ');
  }
  if (testGroups[target]) {
    return testGroups[target].suites.map(k => testSuites[k].runner).join(' ');
  }
  if (testSuites[target]) {
    return testSuites[target].runner;
  }
  console.error(`Unknown target: ${target}`);
  process.exit(1);
}

const pattern = getTestPattern(target);
const command = `npx jest ${pattern} --runInBand --config jest.config.js ${jestArgs}`.trim();

try {
  execSync(command, { stdio: 'inherit', env: { ...process.env, FORCE_COLOR: '1' } });
  process.exit(0);
} catch (error) {
  process.exit(1);
}
```

### `.env.example`

Template for environment variables:

```env
# Required
BASE_URL=https://your-api.example.com/v1

# Authentication
AUTH_TOKEN=

# Test Data
TEST_PHONE=+447700900123
TEST_OTP_CODE=123456

# Retry
RETRY_ENABLED=true
RETRY_COUNT=2
RETRY_DELAY_MS=1000

# Debug
LOG_LEVEL=info
LOG_REQUEST_BODY=false
LOG_RESPONSE_BODY=false
```

---

## Test Architecture

### Graceful Skip Pattern

Every test file checks for `BASE_URL` and skips if not configured. This makes tests safe to run in any environment:

```js
let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';

const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('My Feature', () => {
  test('should work', async () => {
    // test body
  });
});
```

### Ordered Execution

Each suite defines test execution order via `test-suite.config.js` and a runner file:

**`tests/my-suite/test-suite.config.js`:**
```js
module.exports = {
  testOrder: [
    './step-one.test.js',
    './step-two.test.js',
    './step-three.test.js'
  ]
};
```

**`tests/my-suite/run-tests-in-order.test.js`:**
```js
const path = require('path');
const { testOrder } = require('./test-suite.config');

describe('Ordered Execution', () => {
  testOrder.forEach((testFile) => {
    const testPath = path.join(__dirname, testFile);
    const testName = path.basename(testFile, '.test.js');

    describe(`Running: ${testName}`, () => {
      require(testPath);
    });
  });
});
```

### Test Data Factory Pattern

Use `beforeAll` to create a verified customer (or whatever test entity you need):

```js
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let testCustomer = null;

describeOrSkip('My Feature', function() {
  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  test('should do something with the customer', async function() {
    const response = await request(baseUrl)
      .get('/my-endpoint')
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(response.status).toBe(STATUS.OK);
  });
});
```

### Standard Test File Structure

Each test file follows this pattern:

```js
const request = require('supertest');
const { STATUS, MY_ENDPOINTS } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Feature Name', () => {

  describe('Happy Path', () => {
    test('should return 200 on success', async () => {
      const response = await request(baseUrl)
        .get(MY_ENDPOINTS.SOME_ENDPOINT)
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Negative Cases - Validation Errors', () => {
    test('should return 422 for missing required field', async () => {
      const response = await request(baseUrl)
        .post(MY_ENDPOINTS.SOME_ENDPOINT)
        .send({ /* missing fields */ });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
  });

  describe('Negative Cases - Authorization Errors', () => {
    test('should return 401 without auth token', async () => {
      const response = await request(baseUrl)
        .get(MY_ENDPOINTS.SOME_ENDPOINT)
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
```

---

## Writing New Tests

### Step 1: Create Suite Directory

```bash
mkdir tests/my-new-suite
```

### Step 2: Define Test Order

Create `tests/my-new-suite/test-suite.config.js`:

```js
module.exports = {
  testOrder: [
    './feature-a.test.js',
    './feature-b.test.js'
  ]
};
```

### Step 3: Create Ordered Runner

Create `tests/my-new-suite/run-tests-in-order.test.js` (copy boilerplate):

```js
const path = require('path');
const { testOrder } = require('./test-suite.config');

describe('Orders Test - Ordered Execution', () => {
  testOrder.forEach((testFile) => {
    const testPath = path.join(__dirname, testFile);
    const testName = path.basename(testFile, '.test.js');

    describe(`Running: ${testName}`, () => {
      require(testPath);
    });
  });
});
```

### Step 4: Write Test Files

Create individual test files following the [Standard Test File Structure](#standard-test-file-structure).

### Step 5: Add Endpoints to Constants

Add your API endpoints to `test-data/constants.js`:

```js
const MY_ENDPOINTS = {
  GET_ALL: 'my-domain/items',
  GET_BY_ID: (id) => `my-domain/items/${id}`,
  CREATE: 'my-domain/items',
  UPDATE: (id) => `my-domain/items/${id}`,
  DELETE: (id) => `my-domain/items/${id}`
};

module.exports = {
  // ... existing exports
  MY_ENDPOINTS,
};
```

### Step 6: Register in Suite Config

Add your suite to `test.config.js`:

```js
const testSuites = {
  // ... existing suites
  'my-new-suite': {
    name: 'My New Feature',
    runner: 'tests/my-new-suite/run-tests-in-order.test.js',
    description: 'Tests for my new feature',
    tags: ['my-tag', 'feature'],
  },
};
```

### Step 7: Run Your Tests

```bash
npm test -- my-new-suite
```

---

## Utilities

### `utilities/apiClient.js`

SuperTest-based HTTP client wrapper. Provides `get`, `post`, `put`, `patch`, `del` methods with automatic auth header injection:

```js
const apiClient = require('../../utilities/apiClient');

// GET request
const response = await apiClient.get('/endpoint', { role: 'customer', query: { page: 1 } });

// POST request
const response = await apiClient.post('/endpoint', { name: 'test' }, { role: 'customer' });
```

### `utilities/createCustomer.js`

Full customer lifecycle helper. Generates random user data, verifies phone, verifies email, registers, sets profile, and updates KYC:

```js
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

// Create a fully verified customer
const customer = await createVerifiedCustomer(baseUrl);
// Returns: { user, token, deviceToken, payload, deviceDetails, response }

// Create with overrides
const customer = await createVerifiedCustomer(baseUrl, {
  email: 'specific@test.com',
  telephone: '+2348012345678'
});

// Create without KYC
const customer = await createVerifiedCustomer(baseUrl, {}, { kycLevel: false });
```

**Helper functions also available:**

```js
const { generateUserPayload, verifyPhone, verifyEmail, generateDeviceDetails } = require('../../utilities/createCustomer');

const payload = generateUserPayload({ email: 'custom@test.com' });
await verifyPhone(baseUrl, '+2348012345678');
await verifyEmail(baseUrl, 'test@example.com');
const device = generateDeviceDetails();
```

### `utilities/logger.js`

Configurable leveled logger (debug, info, warn, error). Respects `LOG_LEVEL` env var:

```js
const logger = require('../../utilities/logger');

logger.info('Starting test suite');
logger.debug('Request payload:', payload);
logger.error('Unexpected status:', response.status);
logger.step('Creating test customer');
```

### `utilities/testHeaders.js`

Returns common HTTP headers for unauthenticated requests:

```js
const { getCommonHeaders } = require('../../utilities/testHeaders');

const response = await request(baseUrl)
  .get('/endpoint')
  .set(getCommonHeaders());
```

---

## Running Tests

### All Tests

```bash
npm test
# or
npm test -- all
```

### By Suite

```bash
npm test -- <suite-name>

# Examples:
npm test -- my-new-suite
npm test -- login
npm test -- swap-deal
npm test -- users
```

### By Group

```bash
npm test -- smoke         # Quick sanity checks
npm test -- critical      # Core user flows
npm test -- regression    # Full regression
npm test -- auth          # Authentication tests
npm test -- transaction   # Transaction-related tests
npm test -- onboarding    # User onboarding flow
```

### Single Test File

```bash
npx jest tests/my-suite/my-test.test.js
npx jest --config jest.config.js tests/my-suite/my-test.test.js
```

### With Extra Jest Args

```bash
npm test -- my-suite --verbose
npm test -- my-suite --testNamePattern="should return 200"
```

---

## Test Reports

### Local

HTML reports are generated in the `reports/` directory after each run:

```
reports/
├── test-report.html           # Main HTML report
└── coverage/                  # Code coverage (if configured)
    ├── lcov-report/
    ├── lcov.info
    └── index.html
```

### CI

CI generates additional JUnit XML for GitHub Actions integration:

```
reports/ci/
├── test-report-ci.html
├── junit.xml
└── coverage-compliance/
```

---

## CI/CD Integration

### GitHub Actions Workflow

The framework includes a GitHub Actions workflow (`.github/workflows/api-tests.yml`) that:

1. Checks out the backend API and test repos
2. Sets up environment variables from GitHub Secrets
3. Installs backend dependencies and runs migrations
4. Seeds the database with test data
5. Starts the backend server
6. Waits for health check
7. Installs test dependencies
8. Runs the full test suite
9. Uploads test reports as artifacts

### Required GitHub Secrets

| Secret | Purpose |
|--------|---------|
| `TEST_REPO_PAT` | PAT for checking out private test repo |
| `TEST_REPO_DOT_ENV` | Base64-encoded `.env` for tests |
| `DOT_ENV_TEST` | Base64-encoded `.env.test` for backend |

### Workflow Template

```yaml
name: API Integration Tests

on:
  workflow_call:
  workflow_dispatch:

jobs:
  api-tests:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: rootpassword
          MYSQL_DATABASE: test
          MYSQL_USER: ci
          MYSQL_PASSWORD: ci_password
        ports:
          - 3306:3306
        options: >-
          --health-cmd="mysqladmin ping -h 127.0.0.1"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=5
      redis:
        image: redis:7-alpine
        ports:
          - 6379:6379

    steps:
      - name: Checkout backend
        uses: actions/checkout@v5
        with:
          path: backend-api

      - name: Checkout tests
        uses: actions/checkout@v5
        with:
          repository: your-org/your-api-tests
          token: ${{ secrets.TEST_REPO_PAT }}
          path: api-tests

      - name: Setup test env
        working-directory: api-tests
        env:
          TEST_ENV: ${{ secrets.TEST_REPO_DOT_ENV }}
        run: echo "$TEST_ENV" | base64 --decode > .env

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version-file: backend-api/.nvmrc

      - name: Install & migrate backend
        working-directory: backend-api
        run: |
          yarn install --frozen-lockfile
          npx sequelize-cli db:migrate

      - name: Start backend
        working-directory: backend-api
        run: node server.js &
        env:
          PORT: 4000

      - name: Wait for backend
        run: |
          for i in $(seq 1 30); do
            if curl -s http://localhost:4000/health > /dev/null; then
              echo "Backend ready"
              exit 0
            fi
            sleep 2
          done
          exit 1

      - name: Install test deps
        working-directory: api-tests
        run: npm install

      - name: Run tests
        working-directory: api-tests
        run: npm test all

      - name: Upload reports
        if: always()
        uses: actions/upload-artifact@v7
        with:
          name: test-reports
          path: api-tests/reports/
          retention-days: 14
```

---

## Conventions

### File Naming

- Test files: `<feature-name>.test.js` (kebab-case)
- Suite directories: `<suite-name>/` (kebab-case)
- Utility files: `<utility-name>.js` (camelCase)
- Config files: `<name>.config.js` or `<name>.config.<scope>.js`

### Test Structure

Every test file follows this order:

1. **Imports** - `supertest`, constants, utilities
2. **Base URL setup** - Read from env, append trailing slash
3. **Graceful skip** - `describeOrSkip` pattern
4. **`beforeAll`** - Create test data (customer, etc.)
5. **Happy Path** - Successful operations
6. **Negative Cases - Validation** - 422 responses for bad input
7. **Negative Cases - Authorization** - 401 responses for missing/bad auth

### Naming Conventions

- Test descriptions start with `should` (e.g., `test('should return 200 on success', ...)`)
- `describe` blocks use the feature name or category (e.g., `describe('Happy Path', ...)`)
- Constants use UPPER_SNAKE_CASE for status codes, PascalCase for endpoint objects
- Utility functions use camelCase

### Assertions

Use Jest's built-in `expect`:

```js
expect(response.status).toBe(STATUS.OK);
expect(response.body).toHaveProperty('data');
expect(Array.isArray(response.body.data)).toBe(true);
expect(response.body.data.length).toBeGreaterThan(0);
```

### Auth Headers

Authenticated requests require:

```js
.set('Authorization', `Bearer ${token}`)
.set('SS-Device-Token', deviceToken)
.set('userAgent', 'api-test')
```

### Data Dependencies

- Tests within a suite may depend on data created in previous tests
- Always use `test-suite.config.js` to enforce execution order
- Use `--runInBand` (sequential execution) when running suites with dependencies
- Never assume data from one test file exists in another unless using the ordered runner

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests |
| `npm test -- <suite>` | Run a specific suite |
| `npm test -- <group>` | Run a group of suites |
| `npx jest <file>` | Run a single test file |
| `npx jest --config jest.config.js <file>` | Run single file with dedicated config |

| File | Purpose |
|------|---------|
| `config/config.js` | Centralized env-based configuration |
| `jest.config.js` | Jest settings (timeout, reporters, transform) |
| `jest.setup.js` | Pre-test setup (dotenv, global timeout) |
| `test.config.js` | Suite registry and group definitions |
| `runTests.js` | Custom runner with suite/group targeting |
| `test-data/constants.js` | All API endpoints and status codes |
| `utilities/apiClient.js` | SuperTest HTTP client wrapper |
| `utilities/createCustomer.js` | Test data factory for customer onboarding |
