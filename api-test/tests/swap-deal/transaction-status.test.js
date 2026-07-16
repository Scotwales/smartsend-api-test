const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { createSwapDeal } = require('../../utilities/createSwapDeal');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
let swapDealId = null;

describeOrSkip('Transaction Status', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
    swapDealId = await createSwapDeal(baseUrl, testCustomer);
  });

  describe('Happy Path', function() {

    test('should fetch transaction status for a valid swap deal', async function() {
      expect(swapDealId).toBeTruthy();

      const response = await request(baseUrl)
        .get(SWAP_DEAL.TRANSACTION_STATUS(swapDealId))
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .get(SWAP_DEAL.TRANSACTION_STATUS(1))
        .set('userAgent', 'api-test');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
