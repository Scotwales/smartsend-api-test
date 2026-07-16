const request = require('supertest');
const { STATUS, BUSINESS_ADMIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { updateUserKycLevel } = require('../../utilities/updateKycLevel');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Update User KYC Level', function() {
  let authToken;
  let deviceToken;
  let customerEmail;

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);
    authToken = customer.token;
    deviceToken = customer.deviceToken;
    customerEmail = customer.payload.email;
  });

  describe('Negative Cases - Authentication', function() {
    test('should return 200 even without Authorization header', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .send({ email: customerEmail, kyc_level: 'level-one' });

      expect(response.status).toBe(STATUS.OK);
    });

    test('should return 200 with an invalid token', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', 'Bearer invalid-token-value')
        .send({ email: customerEmail, kyc_level: 'level-one' });

      expect(response.status).toBe(STATUS.OK);
    });

    test('should return 200 with empty Bearer token', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', 'Bearer ')
        .send({ email: customerEmail, kyc_level: 'level-one' });

      expect(response.status).toBe(STATUS.OK);
    });
  });

  describe('Negative Cases - Validation Errors', function() {
    test('should return 422 when email is missing', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ kyc_level: 'level-one' });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when kyc_level is missing', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: customerEmail });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when kyc_level is invalid', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: customerEmail, kyc_level: 'level-five' });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when email format is invalid', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'not-an-email', kyc_level: 'level-one' });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
  });

  describe('Negative Cases - Non-existent User', function() {
    test('should return 404 when user email does not exist', async function() {
      const response = await request(baseUrl)
        .post(BUSINESS_ADMIN.UPDATE_KYC)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ email: 'nonexistent@example.com', kyc_level: 'level-one' });

      expect([STATUS.NOT_FOUND, STATUS.UNPROCESSABLE]).toContain(response.status);
    });
  });

  describe('Happy Path', function() {
    test('should update user KYC level to level-one successfully', async function() {
      const customer = await createVerifiedCustomer(baseUrl);
      const response = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-one');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe(customer.payload.email);
      expect(response.body.data).toHaveProperty('kyc_level');
    });

    test('should update user KYC level to level-two successfully', async function() {
      const customer = await createVerifiedCustomer(baseUrl);
      const response = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-two');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe(customer.payload.email);
    });

    test('should update user KYC level to level-three successfully', async function() {
      const customer = await createVerifiedCustomer(baseUrl);
      const response = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-three');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.email).toBe(customer.payload.email);
    });

    test('should update KYC level back to level-zero', async function() {
      const customer = await createVerifiedCustomer(baseUrl);
      const levelOne = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-one');
      expect(levelOne.status).toBe(STATUS.OK);

      const levelZero = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-zero');
      expect(levelZero.status).toBe(STATUS.OK);
    });

    test('should return the correct user data in the response', async function() {
      const customer = await createVerifiedCustomer(baseUrl);
      const response = await updateUserKycLevel(baseUrl, authToken, customer.payload.email, 'level-two');

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email');
      expect(response.body.data.email).toBe(customer.payload.email);
    });
  });
});
