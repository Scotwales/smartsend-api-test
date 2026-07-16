const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Source Currencies', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should fetch source currencies successfully', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.SOURCE_CURRENCIES)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);

      const firstCurrency = response.body.data[0];
      expect(firstCurrency).toHaveProperty('code');
      expect(firstCurrency).toHaveProperty('name');
    });

    test('should return data as an array of currency objects', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.SOURCE_CURRENCIES)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.OK);
      response.body.data.forEach(currency => {
        expect(currency).toHaveProperty('code');
        expect(currency).toHaveProperty('name');
      });
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.SOURCE_CURRENCIES)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
