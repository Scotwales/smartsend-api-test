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
let destCurrencyCode = null;

async function getDestCurrencyCode() {
  const src = await request(baseUrl)
    .get(SWAP_DEAL.SOURCE_CURRENCIES)
    .set('Authorization', `Bearer ${testCustomer.token}`)
    .set('SS-Device-Token', testCustomer.deviceToken)
    .set('userAgent', 'api-test');

  if (src.status !== STATUS.OK || !src.body.data?.length) return null;

  const dest = await request(baseUrl)
    .get(SWAP_DEAL.DESTINATION_CURRENCIES(src.body.data[0].id))
    .set('Authorization', `Bearer ${testCustomer.token}`)
    .set('SS-Device-Token', testCustomer.deviceToken)
    .set('userAgent', 'api-test');

  if (dest.status !== STATUS.OK || !dest.body.data?.length) return null;
  return dest.body.data[0].code;
}

describeOrSkip('Add Beneficiary Details', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl, {}, { kycLevel: 'level-two' });
    swapDealId = await createSwapDeal(baseUrl, testCustomer);
    destCurrencyCode = await getDestCurrencyCode();
  });

  describe('Happy Path', function() {

    test('should add beneficiary details with valid data', async function() {
      expect(swapDealId).toBeTruthy();
      expect(destCurrencyCode).toBeTruthy();

      const beneficiaryPayload = {
        destination_currency: destCurrencyCode,
        swap_deal_id: swapDealId,
        narration: 'Test payment',
        save_beneficiary: true,
        interac_email: 'john.doe@example.com',
        first_name: 'John',
        last_name: 'Doe',
        mobile_number: '+14162345678'
      };

      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send(beneficiaryPayload);
      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when destination_currency is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          swap_deal_id: 1,
          save_beneficiary: true,
          bank_account_number: '1234567890',
          bank_code: '001',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when swap_deal_id is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: destCurrencyCode || 'CAD',
          save_beneficiary: true,
          bank_account_number: '1234567890',
          bank_code: '001',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when save_beneficiary is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: destCurrencyCode || 'CAD',
          swap_deal_id: 1,
          bank_account_number: '1234567890',
          bank_code: '001',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when bank_account_number is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: destCurrencyCode || 'CAD',
          swap_deal_id: 1,
          save_beneficiary: true,
          bank_code: '001',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when bank_code is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: destCurrencyCode || 'CAD',
          swap_deal_id: 1,
          save_beneficiary: true,
          bank_account_number: '1234567890',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when account_name is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: destCurrencyCode || 'CAD',
          swap_deal_id: 1,
          save_beneficiary: true,
          bank_account_number: '1234567890',
          bank_code: '001'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ADD_BENEFICIARY)
        .set('userAgent', 'api-test')
        .send({
          destination_currency: 'CAD',
          swap_deal_id: 1,
          save_beneficiary: true,
          bank_account_number: '1234567890',
          bank_code: '001',
          account_name: 'Test Account'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
