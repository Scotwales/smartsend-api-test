const request = require('supertest');
const { COUNTRY_ID, STATUS, REGISTER, USER, BUSINESS_ADMIN, PHONEVERIFICATION, EMAILVERIFICATION, OTP } = require('../test-data/constants');
const EmailGenerator = require('../test-data/EmailGenerator');
const PhoneNumberGenerator = require('../test-data/PhoneNumberGenerator');


function generateDeviceDetails() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return {
    device_name: 'api-test-device-' + random,
    device_id: 'device-id-' + timestamp + '-' + random
  };
}

/**
 * Generates a random user payload for registration
 * @param {Object} overrides - Fields to override
 * @returns {Object} User payload
 */
function generateUserPayload(overrides = {}) {
  const firstName = overrides.first_name || EmailGenerator.getRandomFirstName();
  const lastName = overrides.last_name || EmailGenerator.getRandomLastName();
  const emailBase = firstName + lastName;
  const email = overrides.email || EmailGenerator.getRandomEmail(emailBase);
  const phone = overrides.telephone || PhoneNumberGenerator.generateNigerianPhoneNumber();

  return {
    first_name: firstName,
    last_name: lastName,
    middle_name: null,
    email: email,
    password: 'Password@1',
    telephone: phone,
    residence_country_id: overrides.residence_country_id || COUNTRY_ID.NIGERIA,
    nationality_country_id: null,
    referral_code: null,
    terms: '1',
    account_type: overrides.account_type || 'individual-business',
    device_details: generateDeviceDetails(),
    ...overrides,
  };
}

/**
 * Verifies phone number via OTP
 * @param {string} baseUrl - API base URL
 * @param {string} phoneNumber - Phone number to verify
 * @returns {Object} Verification response
 */
async function verifyPhone(baseUrl, phoneNumber) {
  const sendResponse = await request(baseUrl)
    .post(PHONEVERIFICATION.SEND_OTP)
    .send({ phone: phoneNumber });

  if (sendResponse.status !== STATUS.OK) {
    throw new Error('Failed to send phone OTP: ' + JSON.stringify(sendResponse.body));
  }

  const viewOtp = await request(baseUrl)
    .post(OTP.VIEW_OTP)
    .send({
      type: 'phone_number',
      phone_number: phoneNumber
    });

  if (viewOtp.status !== STATUS.OK) {
    throw new Error('Failed to view phone OTP: ' + JSON.stringify(viewOtp.body));
  }

  const otpCode = viewOtp.body.data.otp;

  const verifyResponse = await request(baseUrl)
    .post(PHONEVERIFICATION.VERIFY_OTP)
    .send({ phone: phoneNumber, code: otpCode });

  if (verifyResponse.status !== STATUS.OK) {
    throw new Error('Failed to verify phone OTP: ' + JSON.stringify(verifyResponse.body));
  }

  return verifyResponse;
}

/**
 * Verifies email via OTP
 * @param {string} baseUrl - API base URL
 * @param {string} email - Email to verify
 * @returns {Object} Verification response
 */
async function verifyEmail(baseUrl, email) {
  const sendResponse = await request(baseUrl)
    .post(EMAILVERIFICATION.SEND_OTP)
    .send({ email: email });

  if (sendResponse.status !== STATUS.OK) {
    throw new Error('Failed to send email OTP: ' + JSON.stringify(sendResponse.body));
  }

  const viewOtp = await request(baseUrl)
    .post(OTP.VIEW_OTP)
    .send({
      type: 'email',
      email: email
    });

  if (viewOtp.status !== STATUS.OK) {
    throw new Error('Failed to view email OTP: ' + JSON.stringify(viewOtp.body));
  }

  const otpCode = viewOtp.body.data.otp;

  const verifyResponse = await request(baseUrl)
    .post(EMAILVERIFICATION.VERIFY_OTP)
    .send({ email: email, code: otpCode });

  if (verifyResponse.status !== STATUS.OK) {
    throw new Error('Failed to verify email OTP: ' + JSON.stringify(verifyResponse.body));
  }

  return verifyResponse;
}

/**
 * Creates a fully verified customer (phone + email verified + registered)
 * Sets profile fields and KYC level to level-one by default so the customer
 * can access swap-deal and other protected endpoints.
 *
 * @param {string} baseUrl - API base URL
 * @param {Object} overrides - Optional overrides for user data
 * @param {Object} [options] - Additional options
 * @param {string|false} [options.kycLevel='level-one'] - KYC level to set, or false to skip
 * @param {Object|false} [options.profileData] - Profile fields to update, or false to skip
 * @returns {Object} Registration response with user data and token
 */
async function createVerifiedCustomer(baseUrl, overrides = {}, options = {}) {
  const payload = generateUserPayload(overrides);

  await verifyPhone(baseUrl, payload.telephone);
  await verifyEmail(baseUrl, payload.email);

  const response = await request(baseUrl)
    .post(REGISTER.REGISTER)
    .set('userAgent', 'api-test')
    .send(payload);

  if (response.status !== STATUS.OK) {
    throw new Error('Failed to register customer: ' + JSON.stringify(response.body));
  }

  const token = response.body.data.token;
  const deviceToken = response.body.data.device_token;

  const profileData = options.profileData !== false
    ? (options.profileData || {
        first_name: payload.first_name,
        last_name: payload.last_name,
        gender: 'male',
        dob: '1990-01-15',
        occupation: 'Engineer'
      })
    : null;

  if (profileData) {
    const profileResponse = await request(baseUrl)
      .post(USER.UPDATE_PROFILE)
      .set('Authorization', `Bearer ${token}`)
      .set('SS-Device-Token', deviceToken)
      .send(profileData);

    if (profileResponse.status !== STATUS.OK) {
      throw new Error('Failed to update profile: ' + JSON.stringify(profileResponse.body));
    }
  }

  const kycLevel = options.kycLevel !== false
    ? (options.kycLevel || 'level-one')
    : null;

  if (kycLevel) {
    const kycResponse = await request(baseUrl)
      .post(BUSINESS_ADMIN.UPDATE_KYC)
      .set('Authorization', `Bearer ${token}`)
      .send({ email: payload.email, kyc_level: kycLevel });

    if (kycResponse.status !== STATUS.OK) {
      throw new Error('Failed to update KYC level: ' + JSON.stringify(kycResponse.body));
    }
  }

  return {
    user: response.body.data.user,
    token: token,
    deviceToken: deviceToken,
    payload: payload,
    deviceDetails: payload.device_details,
    response: response.body
  };
}

module.exports = {
  generateDeviceDetails,
  generateUserPayload,
  verifyPhone,
  verifyEmail,
  createVerifiedCustomer
};