const request = require('supertest');
const { STATUS, FORGOT_PASSWORD, RESET_PASSWORD, OTP } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// Shared test customer for all tests in this suite
let testCustomer = null;

/**
 * Helper function to get the OTP for password reset
 * @param {string} baseUrl - API base URL
 * @param {string} email - User email
 * @returns {string} The OTP code
 */
async function getPasswordResetOtp(baseUrl, email) {
  // Trigger forgot password to send OTP
  const forgotResponse = await request(baseUrl)
    .post(FORGOT_PASSWORD.FORGOT)
    .send({ email: email });

  if (forgotResponse.status !== STATUS.OK) {
    throw new Error('Failed to trigger forgot password: ' + JSON.stringify(forgotResponse.body));
  }

  // View the OTP
  const viewOtp = await request(baseUrl)
    .post(OTP.VIEW_OTP)
    .send({
      type: 'email',
      email: email
    });

  if (viewOtp.status !== STATUS.OK) {
    throw new Error('Failed to view OTP: ' + JSON.stringify(viewOtp.body));
  }

  return viewOtp.body.data.otp;
}

describeOrSkip('Reset Password', function() {

  // Create a single customer for all tests in this suite
  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
  });

  describe('Happy Path - Complete Flow', function() {

    test('should reset password successfully using OTP from forgot password', async function() {
      // Get the OTP for password reset
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const newPassword = 'NewPassword@123';
      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          email: testCustomer.payload.email,
          password: newPassword,
          password_confirmation: newPassword
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.status).toBe(true);
    });

  });

  describe('Negative Cases - Validation Errors', function() {

    test('should return 422 when reference is missing', async function() {
      await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          email: testCustomer.payload.email,
          password: 'NewPassword@123',
          password_confirmation: 'NewPassword@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when email is missing', async function() {
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          password: 'NewPassword@123',
          password_confirmation: 'NewPassword@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password is missing', async function() {
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          email: testCustomer.payload.email,
          password_confirmation: 'NewPassword@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password_confirmation is missing', async function() {
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          email: testCustomer.payload.email,
          password: 'NewPassword@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password is too short', async function() {
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          email: testCustomer.payload.email,
          password: 'short',
          password_confirmation: 'short'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password_confirmation does not match password', async function() {
      const otp = await getPasswordResetOtp(baseUrl, testCustomer.payload.email);

      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: otp,
          email: testCustomer.payload.email,
          password: 'NewPassword@123',
          password_confirmation: 'DifferentPassword@456'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 403 when using invalid/expired OTP', async function() {
      const response = await request(baseUrl)
        .post(RESET_PASSWORD.RESET)
        .send({
          reference: 'invalid-otp-reference',
          email: testCustomer.payload.email,
          password: 'NewPassword@123',
          password_confirmation: 'NewPassword@123'
        });

      expect(response.status).toBe(STATUS.BAD_REQUEST);
    });

  });

});