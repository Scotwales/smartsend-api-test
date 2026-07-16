const request = require('supertest');
const { STATUS, FORGOT_PASSWORD } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// Shared test customer for all tests in this suite
let testCustomer = null;

describeOrSkip('Forgot Password', function() {

  // Create a single customer for all tests in this suite
  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should dispatch OTP for password reset successfully', async function() {
      const response = await request(baseUrl)
        .post(FORGOT_PASSWORD.FORGOT)
        .send({
          email: testCustomer.payload.email
        });

      expect(response.status).toBe(STATUS.OK);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when email is missing', async function() {
      const response = await request(baseUrl)
        .post(FORGOT_PASSWORD.FORGOT)
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when email format is invalid', async function() {
      const response = await request(baseUrl)
        .post(FORGOT_PASSWORD.FORGOT)
        .send({
          email: 'not-an-email'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 403 when email is not registered', async function() {
      const response = await request(baseUrl)
        .post(FORGOT_PASSWORD.FORGOT)
        .send({
          email: 'nonexistent@example.com'
        });

      expect(response.status).toBe(STATUS.BAD_REQUEST);
      expect(response.body.error.message).toBe("We can't find a user with that email address.");
    });

  });

});