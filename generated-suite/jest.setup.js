/**
 * Jest Setup File
 * Runs before all tests
 */

require('dotenv').config({ quiet: true });

if (!process.env.BASE_URL) {
  console.warn(
    'BASE_URL is not set. Integration tests requiring a live API will be skipped.'
  );
}

jest.setTimeout(300000);
