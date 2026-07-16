const request = require('supertest');
const { STATUS, USER } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');



let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Get Authenticated User Profile', function() {
  let authToken;
  let deviceToken;
  let userData;

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);
    authToken = customer.token;
    deviceToken = customer.deviceToken;
    userData = customer.user;
  });

  describe('Happy Path', function() {
    test('should return 200 with user profile when authenticated', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);
        

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    test('response data should have required user fields', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(STATUS.OK);

      const profile = response.body.data;
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('email');
      expect(profile).toHaveProperty('country');
      expect(profile).toHaveProperty('resident_country');
      expect(profile).toHaveProperty('email_verified');
      expect(profile).toHaveProperty('kyc_level');
      expect(profile).toHaveProperty('user_type');
      expect(profile).toHaveProperty('first_name');
      expect(profile).toHaveProperty('last_name');
      expect(profile).toHaveProperty('full_name');
      expect(profile).toHaveProperty('telephone');
    });

    test('resident_country object should have id, name, and region', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(STATUS.OK);

      const residentCountry = response.body.data.resident_country;
      expect(residentCountry).toHaveProperty('id');
      expect(residentCountry).toHaveProperty('name');
      expect(residentCountry).toHaveProperty('region');
      expect(residentCountry).toHaveProperty('phone_code');
      expect(residentCountry).toHaveProperty('iso_code');
    });

    test('email should match the authenticated user', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.email).toBe(userData.email);
    });

  });

  describe('Negative Cases - Authentication', function() {
    test('should return 401 when no Authorization header is provided', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken);

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when an invalid token is provided', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer invalid-token-value');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Authorization header format is invalid', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Basic some-base64-token');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Authorization header is empty', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', '');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Bearer token is empty', async function() {
      const response = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer ');

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });
});
