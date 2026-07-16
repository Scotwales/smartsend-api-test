const request = require('supertest');
const chai = require('chai');
const { STATUS, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Validate Password for Transaction Pin Reset', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should validate password successfully', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY_PASSWORD)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          password: testCustomer.payload.password,
          device_name: 'api-test-device',
          device_id: 'api-test-device-id'
        });

      chai.expect(response.status, 'expected 200 when password is correct').to.equal(STATUS.OK);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when password is missing', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY_PASSWORD)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          device_name: 'api-test-device',
          device_id: 'api-test-device-id'
        });

      chai.expect(response.status, 'expected 422 when password is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password is incorrect', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY_PASSWORD)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          password: 'WrongPassword@1',
          device_name: 'api-test-device',
          device_id: 'api-test-device-id'
        });

      chai.expect(response.status, 'expected 422 when password is incorrect').to.equal(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY_PASSWORD)
        .set('userAgent', 'api-test')
        .send({
          password: testCustomer.payload.password,
          device_name: 'api-test-device',
          device_id: 'api-test-device-id'
        });

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
