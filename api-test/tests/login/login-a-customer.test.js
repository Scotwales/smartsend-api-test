const request = require('supertest');
const { STATUS, LOGIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// Shared test customer for all tests in this suite
let testCustomer = null;

/**
 * Generates random device details for login
 * @returns {Object} Device details object
 */
function generateDeviceDetails() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    device_name: 'api-test-device-' + random,
    device_id: 'device-id-' + timestamp + '-' + random
  };
}

describeOrSkip('Login a Mobile User', function() {

  // Create a single customer for all tests in this suite
  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should login successfully with email and password', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          password: testCustomer.payload.password,
          device_details: generateDeviceDetails()
        });

       expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('user_id');
      expect(response.body.data).toHaveProperty('device_id');
      expect(response.body.data).toHaveProperty('device_name');
      expect(typeof response.body.data.user_id).toBe('string');
      expect(typeof response.body.data.device_id).toBe('string');
      expect(typeof response.body.data.device_name).toBe('string');
    });



  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when email is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          password: testCustomer.payload.password,
          device_details: generateDeviceDetails()
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors).toContainEqual('The email field is required.');
    });

    test('should return 422 when password is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          device_details: generateDeviceDetails()
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors).toContainEqual('The password field is required.');
    });

    test('should return 422 when device_details is missing', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          password: testCustomer.payload.password
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details field is required.'));
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device name field is required.'));
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device id field is required.'));
    });

    test('should return 422 when device_details is empty', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          password: testCustomer.payload.password,
          device_details: {}
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device name field is required.'));
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device id field is required.'));
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toBeInstanceOf(Array);
      expect(response.body.errors).toContainEqual('The email field is required.');
      expect(response.body.errors).toContainEqual('The password field is required.');
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details field is required.'));
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device name field is required.'));
      expect(response.body.errors).toContainEqual(expect.stringContaining('The device details.device id field is required.'));
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 403 when email is not registered', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword@123',
          device_details: generateDeviceDetails()
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toBe('The provided credentials are incorrect.');
    });

    test('should return 403 when password is incorrect', async function() {
      const response = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .send({
          email: testCustomer.payload.email,
          password: 'WrongPassword@123',
          device_details: generateDeviceDetails()
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
      expect(response.body).toHaveProperty('status', 'failed');
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('Incorrect credentials.');
      expect(response.body.error.message).toMatch(/\d+ out of \d+ attempts left/);
    });

  });

});