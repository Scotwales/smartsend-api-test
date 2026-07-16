const request = require('supertest');
const { STATUS, USER, LOGIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Update User Password', function() {
  let authToken;
  let deviceToken;
  let oldPassword;
  let userEmail;
  let deviceDetails;

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);
    authToken = customer.token;
    deviceToken = customer.deviceToken;
    oldPassword = customer.payload.password;
    userEmail = customer.payload.email;
    deviceDetails = customer.payload.device_details;
  });

  function commonHeaders() {
    return request(baseUrl)
      .post(USER.PASSWORD_RESET)
      .set('userAgent', 'api-test')
      .set('SS-Device-Token', deviceToken)
      .set('Authorization', `Bearer ${authToken}`);
  }

  describe('Negative Cases - Authentication', function() {
    test('should return 401 when no Authorization header is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.PASSWORD_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .send({
          old_password: oldPassword,
          new_password: 'SomePass@123',
          new_password_confirmation: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when an invalid token is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.PASSWORD_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer invalid-token-value')
        .send({
          old_password: oldPassword,
          new_password: 'SomePass@123',
          new_password_confirmation: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Bearer token is empty', async function() {
      const response = await request(baseUrl)
        .post(USER.PASSWORD_RESET)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer ')
        .send({
          old_password: oldPassword,
          new_password: 'SomePass@123',
          new_password_confirmation: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });

  describe('Negative Cases - Validation Errors', function() {
    test('should return 422 when old_password is missing', async function() {
      const response = await commonHeaders()
        .send({
          new_password: 'SomePass@123',
          new_password_confirmation: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when new_password is missing', async function() {
      const response = await commonHeaders()
        .send({
          old_password: oldPassword,
          new_password_confirmation: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when new_password_confirmation is missing', async function() {
      const response = await commonHeaders()
        .send({
          old_password: oldPassword,
          new_password: 'SomePass@123'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when new passwords do not match', async function() {
      const response = await commonHeaders()
        .send({
          old_password: oldPassword,
          new_password: 'PassOne@123',
          new_password_confirmation: 'PassTwo@456'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when new_password is too short', async function() {
      const response = await commonHeaders()
        .send({
          old_password: oldPassword,
          new_password: 'Ab1',
          new_password_confirmation: 'Ab1'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when old_password is incorrect', async function() {
      const response = await commonHeaders()
        .send({
          old_password: 'WrongOldPass@123',
          new_password: 'NewPass@123',
          new_password_confirmation: 'NewPass@123'
        });
      
      expect(response.body.error.message).toBe("Incorrect current password")
      expect(response.status).toBe(STATUS.BAD_REQUEST);
    });

    test('should return 422 when body is empty', async function() {
      const response = await commonHeaders()
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
  });

  describe('Happy Path', function() {
    test('should login with the new password after change', async function() {
      const newPassword = 'LoginTestPass@123';
      const changePassword = await commonHeaders()
        .send({
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: newPassword
        });

      expect(changePassword.status).toBe(STATUS.OK);
      expect(changePassword.body.message).toBe('Password reset successfully');

      // Login user with new password
      const loginResponse = await request(baseUrl)
        .post(LOGIN.LOGIN)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .send({ 
          email: userEmail, 
          password: newPassword, 
          userType: 'Customer', 
          device_details: deviceDetails });

      
      expect(loginResponse.status).toBe(STATUS.OK);
    });
  });
});
