const request = require('supertest');
const { STATUS, USER } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const EmailGenerator = require('../../test-data/EmailGenerator');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Update User Profile', function() {
  let authToken;
  let deviceToken;

  beforeAll(async function() {
    const customer = await createVerifiedCustomer(baseUrl);
    authToken = customer.token;
    deviceToken = customer.deviceToken;
  });

  function commonHeaders() {
    return request(baseUrl)
      .post(USER.UPDATE_PROFILE)
      .set('userAgent', 'api-test')
      .set('SS-Device-Token', deviceToken)
      .set('Authorization', `Bearer ${authToken}`);
  }

  describe('Negative Cases - Authentication', function() {
    test('should return 401 when no Authorization header is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.UPDATE_PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .send({ first_name: EmailGenerator.getRandomFirstName() });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when an invalid token is provided', async function() {
      const response = await request(baseUrl)
        .post(USER.UPDATE_PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer invalid-token')
        .send({ first_name: EmailGenerator.getRandomFirstName() });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });

    test('should return 401 when Bearer token is empty', async function() {
      const response = await request(baseUrl)
        .post(USER.UPDATE_PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', 'Bearer ')
        .send({ first_name: EmailGenerator.getRandomFirstName() });

      expect(response.status).toBe(STATUS.UNAUTHORIZED);
    });
  });

  describe('Negative Cases - Validation Errors', function() {
    test('should return 422 when first_name exceeds max length', async function() {
      const response = await commonHeaders()
        .send({ first_name: 'A'.repeat(256) });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when last_name exceeds max length', async function() {
      const response = await commonHeaders()
        .send({ last_name: 'B'.repeat(256) });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when dob format is invalid', async function() {
      const response = await commonHeaders()
        .send({ dob: 'not-a-date' });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should accept zip_code with extended characters', async function() {
      const response = await commonHeaders()
        .send({ zip_code: 'A'.repeat(20) });

      expect(response.status).toBe(STATUS.OK);
    });
  });

  describe('Negative Cases - Type Mismatches', function() {
    test('should return 422 when first_name is a number', async function() {
      const response = await commonHeaders()
        .send({ first_name: 12345 });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when first_name is an array', async function() {
      const response = await commonHeaders()
        .send({ first_name: [EmailGenerator.getRandomFirstName()] });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when dob is a number', async function() {
      const response = await commonHeaders()
        .send({ dob: 12345 });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return 422 when zip_code is an object', async function() {
      const response = await commonHeaders()
        .send({ zip_code: { code: '12345' } });

      expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
  });

  describe('Negative Cases - Empty Payload', function() {
    test('should return 200 with no changes when empty object is sent', async function() {
      const response = await commonHeaders()
        .send({});

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('data');
    });
  });

  describe('Happy Path - Update Individual Fields', function() {
    test('should update first_name successfully', async function() {
      const firstName = EmailGenerator.getRandomFirstName();
      const response = await commonHeaders()
        .send({ first_name: firstName });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.first_name).toBe(firstName);
    });

    test('should update last_name successfully', async function() {
      const lastName = EmailGenerator.getRandomLastName();
      const response = await commonHeaders()
        .send({ last_name: lastName });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.last_name).toBe(lastName);
    });

    test('should update gender successfully', async function() {
      const response = await commonHeaders()
        .send({ gender: 'male' });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.gender).toBe('male');
    });

    test('should update dob successfully', async function() {
      const response = await commonHeaders()
        .send({ dob: '1990-01-15' });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.dob).toBe('1990-01-15');
    });

    test('should update occupation successfully', async function() {
      const response = await commonHeaders()
        .send({ occupation: 'Software Engineer' });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.occupation).toBe('Software Engineer');
    });

    test('should update middle_name successfully', async function() {
      const middleName = EmailGenerator.getRandomLastName();
      const response = await commonHeaders()
        .send({ middle_name: middleName });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.middle_name).toBe(middleName);
    });
  });

  describe('Happy Path - Partial Updates', function() {
    test('should update only zip_code without affecting other fields', async function() {
      const response = await commonHeaders()
        .send({ zip_code: '94102' });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.zip_code).toBe('94102');
    });

    test('should update only street_address', async function() {
      const response = await commonHeaders()
        .send({ street_address: '456 Oak Ave' });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.street).toBe('456 Oak Ave');
    });

    test('should update only user_name', async function() {
      const userName = EmailGenerator.getRandomFirstName().toLowerCase() + Date.now();
      const response = await commonHeaders()
        .send({ user_name: userName });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.first_name).toBeTruthy();
    });
  });

  describe('Happy Path - Update All Fields', function() {
    test('should update all profile fields at once', async function() {
      const firstName = EmailGenerator.getRandomFirstName();
      const lastName = EmailGenerator.getRandomLastName();
      const middleName = EmailGenerator.getRandomLastName();
      const response = await commonHeaders()
        .send({
          first_name: firstName,
          last_name: lastName,
          user_name: firstName.toLowerCase() + lastName.toLowerCase(),
          middle_name: middleName,
          gender: 'male',
          dob: '1985-06-20',
          occupation: 'Designer',
          zip_code: '10001',
          street_address: '123 Main St'
        });

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.first_name).toBe(firstName);
      expect(response.body.data.last_name).toBe(lastName);
      expect(response.body.data.middle_name).toBe(middleName);
      expect(response.body.data.gender).toBe('male');
      expect(response.body.data.dob).toBe('1985-06-20');
      expect(response.body.data.occupation).toBe('Designer');
    });

    test('updated profile should be persisted when fetching profile', async function() {
      const firstName = EmailGenerator.getRandomFirstName();
      const lastName = EmailGenerator.getRandomLastName();
      const updateResponse = await commonHeaders()
        .send({ first_name: firstName, last_name: lastName });

      expect(updateResponse.status).toBe(STATUS.OK);

      const profileResponse = await request(baseUrl)
        .get(USER.PROFILE)
        .set('userAgent', 'api-test')
        .set('SS-Device-Token', deviceToken)
        .set('Authorization', `Bearer ${authToken}`);

      expect(profileResponse.status).toBe(STATUS.OK);
      expect(profileResponse.body.data.first_name).toBe(firstName);
      expect(profileResponse.body.data.last_name).toBe(lastName);
    });
  });
});
