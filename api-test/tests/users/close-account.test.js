const request = require('supertest');
const { STATUS, USER } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Close User Account', function() {
  let authToken;
  let deviceToken;
  let userPassword;

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);

    console.log(JSON.stringify(customer, null, 2));
    authToken = customer.token;
    deviceToken = customer.deviceToken;
    userPassword = customer.payload.password;
  });

  function commonHeaders() {
    return request(baseUrl)
      .post(USER.DELETE_ACCOUNT)
      .set('userAgent', 'api-test')
      .set('SS-Device-Token', deviceToken)
      .set('Authorization', `Bearer ${authToken}`);
  }

  describe('Negative Cases - Authentication', function() {
    test('should return 401 when no Authorization header is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.DELETE_ACCOUNT)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .send({
          password: userPassword,
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when an invalid token is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.DELETE_ACCOUNT)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer invalid-token-value')
        .send({
          password: userPassword,
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Bearer token is empty', async function() {
      const response = await request(baseUrl)
        .post(USER.DELETE_ACCOUNT)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer ')
        .send({
          password: userPassword,
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });

  describe('Negative Cases - Validation Errors', function() {
    test('should return 422 when password is missing', async function() {
      const response = await commonHeaders()
        .send({
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when reason is missing', async function() {
      const response = await commonHeaders()
        .send({
          password: userPassword
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 401 when password is incorrect', async function() {
      const response = await commonHeaders()
        .send({
          password: 'WrongPassword@123',
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 422 when body is empty', async function() {
      const response = await commonHeaders()
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password is an empty string', async function() {
      const response = await commonHeaders()
        .send({
          password: '',
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when reason is an empty string', async function() {
      const response = await commonHeaders()
        .send({
          password: userPassword,
          reason: ''
        });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
  });

  describe('Happy Path', function() {
    test('should return 200 when account is closed successfully', async function() {
      const response = await commonHeaders()
        .send({
          password: userPassword,
          reason: 'No longer using the service'
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('message');
    });

    test('should return 401 when trying to access profile after account deletion', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
