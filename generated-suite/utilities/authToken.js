const config = require('../config/config');
const { assertSecureUrl } = require('./urlSecurity');

let tokenPromise;
let accessToken;
let expiresAt = 0;

async function requestAccessToken() {
  if (!config.clientId || !config.clientSecret) {
    throw new Error('ROUTELINK_CLIENT_ID and ROUTELINK_CLIENT_SECRET are required for OAuth authentication.');
  }
  assertSecureUrl(config.authTokenUrl, 'ROUTELINK_AUTH_TOKEN_URL');

  const response = await fetch(config.authTokenUrl, {
    method: 'POST',
    redirect: 'error',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.clientId,
      client_secret: config.clientSecret
    })
  });

  if (!response.ok) {
    throw new Error(`OAuth token request failed with HTTP ${response.status}.`);
  }

  const tokenResponse = await response.json();
  if (typeof tokenResponse.access_token !== 'string' || !tokenResponse.access_token) {
    throw new Error('OAuth token response did not contain an access_token.');
  }
  const expiresIn = Number(tokenResponse.expires_in) || 60;
  accessToken = tokenResponse.access_token;
  expiresAt = Date.now() + Math.max(expiresIn - 30, 0) * 1000;
  return accessToken;
}

function getAccessToken() {
  if (accessToken && Date.now() < expiresAt) {
    return Promise.resolve(accessToken);
  }
  if (!tokenPromise) {
    tokenPromise = requestAccessToken().finally(() => {
      tokenPromise = null;
    });
  }
  return tokenPromise;
}

module.exports = { getAccessToken };
