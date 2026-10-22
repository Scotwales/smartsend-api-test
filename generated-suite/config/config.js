require('dotenv').config({ quiet: true });

const config = {
  env: process.env.NODE_ENV || 'development',

  baseUrl: (process.env.BASE_URL || 'https://openbanking.staging.routelinkmfb.com').replace(/\/+$/, ''),

  authTokenUrl: process.env.ROUTELINK_AUTH_TOKEN_URL ||
    'https://auth.staging.routelinkmfb.com/realms/routelinkmfb/protocol/openid-connect/token',

  clientId: process.env.ROUTELINK_CLIENT_ID || null,

  clientSecret: process.env.ROUTELINK_CLIENT_SECRET || null,

  signingKeyBase64: process.env.ROUTELINK_SIGNING_KEY_BASE64 || null,

  timeout: parseInt(process.env.TEST_TIMEOUT, 10) || 30000,

  isCi: process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
};

module.exports = config;
