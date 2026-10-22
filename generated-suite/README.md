# Routelink Open Banking API Tests

This project follows the Smartsend API test-suite layout: Jest and SuperTest, one directory per API suite, shared test-data constants, shared utilities, suite execution-order files, and a suite registry/custom runner.

## Project Structure

```text
generated-suite/
├── config/
│   └── config.js
├── test-data/
│   ├── constants.js
│   └── request-schemas.js
├── tests/
│   ├── accounts/
│   ├── corporate-accounts/
│   ├── meta/
│   ├── ping/
│   ├── transactions/
│   └── virtual-accounts/
├── utilities/
│   ├── apiClient.js
│   ├── authToken.js
│   ├── fixtures.js
│   ├── requestSigner.js
│   ├── testHeaders.js
│   └── urlSecurity.js
├── .env.example
├── jest.config.routelink.js
├── jest.setup.js
├── runTestsRoutelink.js
└── test.config.routelink.js
```

Each API suite contains feature-level `.test.js` files, a `test-suite.config.js` execution order, and a `run-tests-in-order.test.js` runner. Tests use Jest `expect` assertions and shared HTTP status/route constants.

## Configure

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Set the partner client ID, client secret, and base64 signing key in `.env`. Do not commit or share these credentials.
4. Add test account/reference values and request payloads as JSON using the property names and types in the Routelink OpenAPI schemas. Corporate-account and sub-merchant requests use separate payload settings.
5. Use a dedicated staging partner and test accounts. Account creation, mandate changes, postings, transfers, tier upgrades, and virtual-account creation are skipped unless `RUN_MUTATION_TESTS=true`.

The shared SuperTest client obtains a client-credentials bearer token and applies Routelink's documented HMAC-SHA-512 request signature, timestamp, and idempotency key. It sends no signing-key header and does not log credentials or payloads. Requests are restricted to Routelink HTTPS hosts; HTTP is allowed only for local loopback use. The OpenAPI document does not define response schemas or cleanup endpoints, so tests assert the documented HTTP 200 status and mutation data is not automatically deleted.

## Run Tests

- `npm test` runs all ordered suites.
- `node runTestsRoutelink.js ping` runs the ping suite.
- `node runTestsRoutelink.js accounts` runs account tests.
- `node runTestsRoutelink.js smoke` runs ping and metadata tests.
- `npm run test:direct` invokes Jest with the Routelink Jest configuration.

Integration suites are skipped if `BASE_URL` is unset. With a base URL configured, missing credentials or required fixtures fail explicitly.
