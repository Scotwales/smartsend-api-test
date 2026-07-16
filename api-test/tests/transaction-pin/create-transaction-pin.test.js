const request = require('supertest');
const chai = require('chai');
const { STATUS, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Create Transaction Pin', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should create a transaction pin successfully', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: '7392',
          pin_confirmation: '7392'
        });

      chai.expect(response.status, 'expected 200 when pin is created').to.equal(STATUS.OK);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when pin is missing', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin_confirmation: '1234'
        });

      chai.expect(response.status, 'expected 422 when pin is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin_confirmation is missing', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: '1234'
        });

      chai.expect(response.status, 'expected 422 when pin_confirmation is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin and pin_confirmation do not match', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: '1234',
          pin_confirmation: '5678'
        });

      chai.expect(response.status, 'expected 422 when pin and confirmation do not match').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin is too short', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: '12',
          pin_confirmation: '12'
        });

      chai.expect(response.status, 'expected 422 when pin is too short').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin contains non-numeric characters', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: 'abcd',
          pin_confirmation: 'abcd'
        });

      chai.expect(response.status, 'expected 422 when pin is non-numeric').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({});

      chai.expect(response.status, 'expected 422 when body is empty').to.equal(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(TRANSACTION_PIN.CREATE)
        .set('userAgent', 'api-test')
        .send({
          pin: '1234',
          pin_confirmation: '1234'
        });

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
