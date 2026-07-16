const request = require('supertest');
const { STATUS, USER, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Reset User Transaction Pin', function() {
  let authToken;
  let deviceToken;
  const initialPin = '7392';
  const newPin = '5183';

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);
    authToken = customer.token;
    deviceToken = customer.deviceToken;

    await request(baseUrl)
      .post(TRANSACTION_PIN.CREATE)
      .set('Authorization', `Bearer ${authToken}`)
      .set('SS-Device-Token', deviceToken)
      .set('userAgent', 'api-test')
      .send({ pin: initialPin, pin_confirmation: initialPin });
  });

  function commonHeaders() {
    return request(baseUrl)
      .post(USER.TRANSACTION_PIN_RESET)
      .set('userAgent', 'api-test')
      .set('SS-Device-Token', deviceToken)
      .set('Authorization', `Bearer ${authToken}`);
  }

  describe('Negative Cases - Authentication', function() {
    test('should return 401 when no Authorization header is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.TRANSACTION_PIN_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .send({ old_pin: initialPin, pin: newPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthenticated. Please login to proceed');
    });

    test('should return 401 when an invalid token is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.TRANSACTION_PIN_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer invalid-token-value')
        .send({ old_pin: initialPin, pin: newPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthenticated. Please login to proceed');
    });

    test('should return 401 when Bearer token is empty', async function() {
      const response = await request(baseUrl)
        .post(USER.TRANSACTION_PIN_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer ')
        .send({ old_pin: initialPin, pin: newPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
      expect(response.body.message).toBe('Unauthenticated. Please login to proceed');
    });
  });

  describe('Negative Cases - Validation Errors', function() {
    test('should return 422 when old_pin is missing', async function() {
      const response = await commonHeaders()
        .send({ pin: newPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body.errors).toContain('The old pin field is required.');
    });

    test('should return 422 when pin is missing', async function() {
      const response = await commonHeaders()
        .send({ old_pin: initialPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body.errors).toContain('The pin field is required.');
    });

    test('should return 422 when pin_confirmation is missing', async function() {
      const response = await commonHeaders()
        .send({ old_pin: initialPin, pin: newPin });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body.errors).toContain('The pin field confirmation does not match.');
    });

    test('should return 422 when pin and pin_confirmation do not match', async function() {
      const response = await commonHeaders()
        .send({ old_pin: initialPin, pin: newPin, pin_confirmation: '9999' });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body.errors).toContain('The pin field confirmation does not match.');
    });

    test('should return 422 when body is empty', async function() {
      const response = await commonHeaders().send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body.errors).toContain('The old pin field is required.');
      expect(response.body.errors).toContain('The pin field is required.');
    });
  });

  describe('Happy Path', function() {
    test('should reset transaction pin successfully with valid old_pin', async function() {
      const response = await commonHeaders()
        .send({ old_pin: initialPin, pin: newPin, pin_confirmation: newPin });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.message).toBe('Transaction pin reset successfully');
      expect(response.body.data).toHaveProperty('id');
    });
  });
});
