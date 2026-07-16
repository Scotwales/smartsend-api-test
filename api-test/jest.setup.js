/**
 * Jest Setup File
 * Runs before all tests
 */

require('dotenv').config();

// Warn if BASE_URL is not set (tests that need it will skip)
if (!process.env.BASE_URL) {
  console.warn(
    '⚠ BASE_URL is not set. Integration tests requiring a live API will be skipped.'
  );
}

// Set timeout for API tests (covers KYC setup + swap deal creation chains)
jest.setTimeout(300000);

// Global test utilities can be added here if needed
