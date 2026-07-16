const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
let sourceCurrencyId = null;

describeOrSkip('Destination Currencies', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);

    const response = await request(baseUrl)
      .get(SWAP_DEAL.SOURCE_CURRENCIES)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    if (response.status === STATUS.OK && response.body.data && response.body.data.length > 0) {
      sourceCurrencyId = response.body.data[0].id;
    }
  });

  describe('Happy Path', function() {

    test('should fetch destination currencies for a valid source currency', async function() {
      expect(sourceCurrencyId).toBeTruthy();

      const response = await request(baseUrl)
        .get(SWAP_DEAL.DESTINATION_CURRENCIES(sourceCurrencyId))
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

    test('should return all destination currencies with code and name', async function() {
      expect(sourceCurrencyId).toBeTruthy();

      const response = await request(baseUrl)
        .get(SWAP_DEAL.DESTINATION_CURRENCIES(sourceCurrencyId))
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
        .get(SWAP_DEAL.DESTINATION_CURRENCIES('USD'))
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
