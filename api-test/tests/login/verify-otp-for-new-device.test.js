const request = require('supertest');
const { STATUS, LOGIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
let loginResponse = null;
let userId = null;
let currentDeviceDetails = null;

function generateDeviceDetails() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    device_name: 'api-test-device--' + random,
    device_id: 'device-id--' + timestamp + '-' + random
  };
}

describeOrSkip('Verify OTP for New Device Registration', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);

    currentDeviceDetails = generateDeviceDetails();

    const response = await request(baseUrl)
      .post(LOGIN.LOGIN)
      .set('userAgent', 'api-test')
      .send({
        email: testCustomer.payload.email,
        password: testCustomer.payload.password,
        device_details: currentDeviceDetails
      });

    loginResponse = response.body;
    userId = response.body.data.user_id;
  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when otp is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          user_id: userId,
          device_id: currentDeviceDetails.device_id,
          device_name: currentDeviceDetails.device_name
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when user_id is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          otp: 123456,
          device_id: currentDeviceDetails.device_id,
          device_name: currentDeviceDetails.device_name
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when device_id is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          otp: 123456,
          user_id: userId,
          device_name: currentDeviceDetails.device_name
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when device_name is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          otp: 123456,
          user_id: userId,
          device_id: currentDeviceDetails.device_id
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when otp is not a number', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          otp: 'not-a-number',
          user_id: userId,
          device_id: currentDeviceDetails.device_id,
          device_name: currentDeviceDetails.device_name
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Invalid OTP', function() {

    test('should return error when OTP is incorrect', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.VERIFY_OTP)
        .set('userAgent', 'api-test')
        .send({
          otp: 999999,
          user_id: userId,
          device_id: currentDeviceDetails.device_id,
          device_name: currentDeviceDetails.device_name
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Happy Path - Complete Flow', function() {

    test('should login with known device without requiring verification', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          password: testCustomer.payload.password,
          device_details: testCustomer.deviceDetails
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('device_token');
      expect(response.body.data).toHaveProperty('user');
    });

  });

});
