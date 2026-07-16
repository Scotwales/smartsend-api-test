const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
const SEND_AMOUNT = 200000;

async function getCurrencyIds() {
  const src = await request(baseUrl)
    .get(SWAP_DEAL.SOURCE_CURRENCIES)
    .set('Authorization', `Bearer ${testCustomer.token}`)
    .set('SS-Device-Token', testCustomer.deviceToken)
    .set('userAgent', 'api-test');

  if (src.status !== STATUS.OK || !src.body.data?.length) return null;
  const sourceId = src.body.data[0].id;
  const sourceCode = src.body.data[0].code;

  const dest = await request(baseUrl)
    .get(SWAP_DEAL.DESTINATION_CURRENCIES(sourceId))
    .set('Authorization', `Bearer ${testCustomer.token}`)
    .set('SS-Device-Token', testCustomer.deviceToken)
    .set('userAgent', 'api-test');

  if (dest.status !== STATUS.OK || !dest.body.data?.length) return null;
  return { sourceId, destId: dest.body.data[0].id, sourceCode, destCode: dest.body.data[0].code };
}

async function getInitiateData(sourceId, destId) {
  const init = await request(baseUrl)
    .post(SWAP_DEAL.INITIATE)
    .set('Authorization', `Bearer ${testCustomer.token}`)
    .set('SS-Device-Token', testCustomer.deviceToken)
    .set('userAgent', 'api-test')
    .send({ source_currency: sourceId, destination_currency: destId, amount: SEND_AMOUNT });

  if (init.status !== STATUS.OK) return null;
  return init.body.data;
}

describeOrSkip('Proceed Swap Deal', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl, {}, { kycLevel: 'level-two' });
  });

  describe('Happy Path', function() {

    test('should proceed a swap deal with valid data', async function() {
      const ids = await getCurrencyIds();
      expect(ids).toBeTruthy();

      const initData = await getInitiateData(ids.sourceId, ids.destId);
      expect(initData).toBeTruthy();
      expect(initData).toHaveProperty('exchange_rate');

      const rate = parseFloat(initData.exchange_rate);
      const useDivision = initData.exchange_rate_currency && !initData.exchange_rate_currency.startsWith('1 ');
      const totalAmount = useDivision
        ? Math.floor((SEND_AMOUNT / rate) * 100) / 100
        : Math.floor(SEND_AMOUNT * rate);

      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: ids.sourceId,
          destination_currency: ids.destId,
          amount: SEND_AMOUNT,
          total_amount: totalAmount
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.credit_amount).toBe(totalAmount);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when source_currency is missing', async function() {
      const ids = await getCurrencyIds();
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: ids.destId,
          amount: 100,
          total_amount: 100
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when destination_currency is missing', async function() {
      const ids = await getCurrencyIds();
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: ids.sourceId,
          amount: 100,
          total_amount: 100
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when amount is missing', async function() {
      const ids = await getCurrencyIds();
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: ids.sourceId,
          destination_currency: ids.destId,
          total_amount: 100
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when total_amount is missing', async function() {
      const ids = await getCurrencyIds();
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          source_currency: ids.sourceId,
          destination_currency: ids.destId,
          amount: 100
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.PROCEED)
        .set('userAgent', 'api-test')
        .send({
          source_currency: 1,
          destination_currency: 1,
          amount: 100,
          total_amount: 100
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
