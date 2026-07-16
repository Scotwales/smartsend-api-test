const request = require('supertest');
const { BUSINESS_ADMIN } = require('../test-data/constants');

/**
 * Updates a user's KYC level
 * @param {string} baseUrl - API base URL
 * @param {string} authToken - Bearer token (customer or admin)
 * @param {string} email - User's email address
 * @param {string} kycLevel - KYC level (level-zero, level-one, level-two, level-three)
 * @param {Object} [options] - Additional options
 * @param {string} [options.deviceToken] - Device token for SS-Device-Token header
 * @returns {Promise<Object>} SuperTest response
 */
async function updateUserKycLevel(baseUrl, authToken, email, kycLevel, options = {}) {
  const url = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';

  const req = request(url)
    .post(BUSINESS_ADMIN.UPDATE_KYC)
    .set('Authorization', `Bearer ${authToken}`)
    .send({ email, kyc_level: kycLevel });

  if (options.deviceToken) {
    req.set('SS-Device-Token', options.deviceToken);
  }

  return req;
}

module.exports = { updateUserKycLevel };
