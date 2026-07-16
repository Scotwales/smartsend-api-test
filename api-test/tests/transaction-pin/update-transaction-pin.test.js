const request = require('supertest');
const chai = require('chai');
const { STATUS, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;

describeOrSkip('Update Transaction Pin', function() {

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

    test('should update transaction pin successfully with correct old_pin', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '7392',
          pin: '2847',
          pin_confirmation: '2847'
        });

      chai.expect(response.status, 'expected 200 when pin is updated with correct old_pin').to.equal(STATUS.OK);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when old_pin is missing', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          pin: '2847',
          pin_confirmation: '2847'
        });

      chai.expect(response.status, 'expected 422 when old_pin is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin is missing', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '7392',
          pin_confirmation: '2847'
        });

      chai.expect(response.status, 'expected 422 when pin is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin_confirmation is missing', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '7392',
          pin: '2847'
        });

      chai.expect(response.status, 'expected 422 when pin_confirmation is missing').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when pin and pin_confirmation do not match', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '7392',
          pin: '2847',
          pin_confirmation: '9999'
        });

      chai.expect(response.status, 'expected 422 when pin and confirmation do not match').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when old_pin is incorrect', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '0000',
          pin: '2847',
          pin_confirmation: '2847'
        });

      chai.expect(response.status, 'expected 422 when old_pin is incorrect').to.equal(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .put(TRANSACTION_PIN.UPDATE)
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
        .put(TRANSACTION_PIN.UPDATE)
        .set('userAgent', 'api-test')
        .send({
          old_pin: '7392',
          pin: '2847',
          pin_confirmation: '2847'
        });

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
