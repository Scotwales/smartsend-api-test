const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Bank List', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should fetch bank list successfully', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.BANK_LIST)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });

    test('should return data as an array of bank objects', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.BANK_LIST)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.BANK_LIST)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
