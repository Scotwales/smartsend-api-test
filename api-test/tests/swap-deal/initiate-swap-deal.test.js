const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Initiate Swap Deal', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should initiate a swap deal with valid currencies and amount', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.INITIATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: 1,
          destination_currency: 1,
          amount: 100
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when source_currency is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.INITIATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: 1
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when destination_currency is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.INITIATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: 1
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.INITIATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.INITIATE)
        .set('userAgent', 'api-test')
        .send({
          source_currency: 1,
          destination_currency: 1
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
