const request = require('supertest');
const { STATUS, FORGOT_PASSWORD, OTP } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// Shared test customer for all tests in this suite
let testCustomer = null;

describeOrSkip('Verify Password Reset OTP', function() {

  // Create a single customer for all tests in this suite
  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path', function() {

    test('should verify OTP for password reset successfully', async function() {
      // First, trigger forgot password to send OTP
      await request(baseUrl)
        .post(FORGOT_PASSWORD.FORGOT)
        .send({ email: testCustomer.payload.email });

      // View the OTP
      const viewOtp = await request(baseUrl)
        .post(OTP.VIEW_OTP)
        .send({
          type: 'email',
          email: testCustomer.payload.email
        });

      expect(viewOtp.status).toBe(STATUS.OK);
      expect(viewOtp.body.data).toHaveProperty('otp');
    });

  });

  describe('Negative Cases', function() {

    test('should return 422 when email is missing', async function() {
      const response = await request(baseUrl)
        .post(OTP.VIEW_OTP)
        .send({
          type: 'email'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when type is missing', async function() {
      const response = await request(baseUrl)
        .post(OTP.VIEW_OTP)
        .send({
          email: testCustomer.payload.email
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

});