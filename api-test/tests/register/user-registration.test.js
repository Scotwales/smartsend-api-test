const request = require('supertest');
const { COUNTRY_ID, STATUS, REGISTER } = require('../../test-data/constants');
const { createVerifiedCustomer, generateUserPayload } = require('../../utilities/createCustomer');
const PhoneNumberGenerator = require('../../test-data/PhoneNumberGenerator');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('User Registration', function() {

  describe('Happy Path - Valid Registrations', function() {

    test('should register a new individual-business user successfully', async function() {
      const result = await createVerifiedCustomer(baseUrl);

      expect(result.response.status).toBe(true);
      expect(result.response.message).toBe('User registered successfully');
      expect(result.response.data).toHaveProperty('token');
      expect(result.response.data).toHaveProperty('user');
      expect(result.user.email).toBe(result.payload.email);
    });


    test('should register with all optional fields provided', async function() {
      const result = await createVerifiedCustomer(baseUrl, {
        middle_name: 'Middle',
        nationality_country_id: COUNTRY_ID.CANADA,
        referral_code: null,
      });

      expect(result.response.status).toBe(true);
      expect(result.response.data).toHaveProperty('token');
    });

    test('should register with device_details in the payload', async function() {
      const result = await createVerifiedCustomer(baseUrl);

      expect(result.response.status).toBe(true);
      expect(result.payload).toHaveProperty('device_details');
      expect(result.payload.device_details).toHaveProperty('device_name');
      expect(result.payload.device_details).toHaveProperty('device_id');
      expect(result.payload.device_details.device_name).toMatch(/^api-test-device-/);
    });

    test('response user object should have required fields', async function() {
      const result = await createVerifiedCustomer(baseUrl);

      expect(result.response.status).toBe(true);

      const user = result.user;
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('email');
      expect(user).toHaveProperty('full_name');
      expect(user).toHaveProperty('first_name');
      expect(user).toHaveProperty('last_name');
      expect(user).toHaveProperty('telephone');
      expect(user).toHaveProperty('resident_country');
      expect(user.full_name).toBe(result.payload.first_name + ' ' + result.payload.last_name);
    });

  });

  describe('Duplicate Registration', function() {

    test('should return error when registering with an already used email', async function() {
      const firstCustomer = await createVerifiedCustomer(baseUrl);
      const phone = PhoneNumberGenerator.generateNigerianPhoneNumber();

      const payload = generateUserPayload({
        email: firstCustomer.payload.email,
        telephone: phone
      });

      await verifyPhoneOnly(baseUrl, payload.telephone);

      const response = await request(baseUrl)
        .post(REGISTER.REGISTER)
        .send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Missing Required Fields', function() {

    test('should return 422 when email is missing', async function() {
      const payload = generateUserPayload();
      delete payload.email;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when password is missing', async function() {
      const payload = generateUserPayload();
      delete payload.password;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when first_name is missing', async function() {
      const payload = generateUserPayload();
      delete payload.first_name;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when last_name is missing', async function() {
      const payload = generateUserPayload();
      delete payload.last_name;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when telephone is missing', async function() {
      const payload = generateUserPayload();
      delete payload.telephone;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when residence_country_id is missing', async function() {
      const payload = generateUserPayload();
      delete payload.residence_country_id;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when account_type is missing', async function() {
      const payload = generateUserPayload();
      delete payload.account_type;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when terms is missing', async function() {
      const payload = generateUserPayload();
      delete payload.terms;
      const response = await request(baseUrl).post(REGISTER.REGISTER).send(payload);

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when body is empty', async function() {
      const response = await request(baseUrl).post(REGISTER.REGISTER).send({});

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

  describe('Negative Cases - Invalid Field Values', function() {

    test('should return 422 for invalid email format', async function() {
      const response = await request(baseUrl)
        .post(REGISTER.REGISTER)
        .send(generateUserPayload({ email: 'not-an-email' }));

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 for invalid account_type', async function() {
      const response = await request(baseUrl)
        .post(REGISTER.REGISTER)
        .send(generateUserPayload({ account_type: 'unknown-type' }));

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 for invalid residence_country_id', async function() {
      const response = await request(baseUrl)
        .post(REGISTER.REGISTER)
        .send(generateUserPayload({ residence_country_id: 'INVALID_ID' }));

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 for a weak password', async function() {
      const response = await request(baseUrl)
        .post(REGISTER.REGISTER)
        .send(generateUserPayload({ password: '123' }));

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

  });

});

async function verifyPhoneOnly(baseUrl, phoneNumber) {
  const { verifyPhone } = require('../../utilities/createCustomer');
  return verifyPhone(baseUrl, phoneNumber);
}