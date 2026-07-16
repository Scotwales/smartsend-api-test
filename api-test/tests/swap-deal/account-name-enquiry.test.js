const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Account Name Enquiry', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should return account name for valid bank code and account number', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          bank_code: '001',
          account_number: '1234567890'
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('account_name');
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when bank_code is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          account_number: '1234567890'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when account_number is missing', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          bank_code: '001'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
        .set('userAgent', 'api-test')
        .send({
          bank_code: '001',
          account_number: '1234567890'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

  });

});
