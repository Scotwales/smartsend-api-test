const request = require('supertest');
const chai = require('chai');
const { STATUS, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Verify Transaction Pin', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);

    await request(baseUrl)
      .post(TRANSACTION_PIN.CREATE)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test')
      .send({ pin: '7392', pin_confirmation: '7392' });
  });

  describe('Happy Path', function() {

    test('should verify transaction pin successfully', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({ pin: '7392' });

      chai.expect(response.status, 'expected 200 when pin is correct').to.equal(STATUS.OK);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when pin is missing', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      chai.expect(response.status, 'expected 422 when pin is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin is incorrect', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({ pin: '9999' });

      chai.expect(response.status, 'expected 422 when pin is incorrect').to.equal(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.VERIFY)
        .set('userAgent', 'api-test')
        .send({ pin: '7392' });

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
