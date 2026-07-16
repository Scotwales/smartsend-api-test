require('dotenv').config();

const authDataStore = require('./utilities/AuthDataStore');

module.exports = async () => {
  if (process.env.AUTH_TOKEN) {
    authDataStore.setCustomerData({
      token: process.env.AUTH_TOKEN,
      userType: 'Customer'
    });
    return;
  }

  const email = process.env.TEST_BOOTSTRAP_EMAIL;
  if (!email) {
    if (process.env.USE_EXISTING_TEST_ACCOUNT !== 'true') {
      console.warn(
        '[globalSetup] No AUTH_TOKEN or TEST_BOOTSTRAP_EMAIL set.\n' +
        '  Phone verification tests will fail with 403 until you configure auth.'
      );
    }
    return;
  }

  const request = require('supertest');
  const baseUrl = (process.env.BASE_URL || 'https://smartsend-dev-api.smartsend.uk/v1').replace(/\/+$/, '');
  const PASSWORD = process.env.TEST_BOOTSTRAP_PASSWORD || 'Password@2';

  const login = await request(baseUrl)
    .post('/auth/login')
    .send({ email, password: PASSWORD, userType: 'Customer' });

  if (login.status !== 200) {
    throw new Error(
      `Global auth bootstrap failed (status ${login.status}): ${JSON.stringify(login.body)}`
    );
  }

  const user = login.body.data && login.body.data.user;
  authDataStore.setCustomerData({
    email: user ? user.email : email,
    password: PASSWORD,
    userType: 'Customer',
    token: login.body.data.token
  });
};
