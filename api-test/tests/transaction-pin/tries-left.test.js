const request = require('supertest');
const chai = require('chai');
const { STATUS, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Transaction Pin Tries Left', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .get(TRANSACTION_PIN.TRIES_LEFT)
        .set('userAgent', 'api-test');

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
