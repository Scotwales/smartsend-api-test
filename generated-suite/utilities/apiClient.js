const request = require('supertest');
const config = require('../config/config');
const { getAccessToken } = require('./authToken');
const { getCommonHeaders } = require('./testHeaders');
const { signedHeaders } = require('./requestSigner');
const { assertSecureUrl } = require('./urlSecurity');

function api() {
  return request(config.baseUrl);
}

function withQuery(path, query) {
  const url = new URL(path, config.baseUrl);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return `${url.pathname}${url.search}`;
}

async function send(method, path, body, extraHeaders) {
  assertSecureUrl(config.baseUrl, 'BASE_URL');
  if (!path.startsWith('/v1/')) {
    throw new Error('API routes must be absolute Routelink v1 paths.');
  }
  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    throw new Error(`Unsupported API method: ${method}.`);
  }

  const url = new URL(path, config.baseUrl);
  if (url.origin !== new URL(config.baseUrl).origin) {
    throw new Error('API request route must use the configured Routelink origin.');
  }

  const accessToken = await getAccessToken();
  const { headers: signatureHeaders, serializedBody } = signedHeaders(
    method,
    `${url.pathname}${url.search}`,
    body
  );
  const headers = {
    ...extraHeaders,
    ...getCommonHeaders(),
    Authorization: `Bearer ${accessToken}`,
    ...signatureHeaders,
  };

  const outgoingRequest = api()[method.toLowerCase()](`${url.pathname}${url.search}`)
    .redirects(0)
    .set(headers);

  if (serializedBody !== '') {
    outgoingRequest
      .set('Content-Type', 'application/json')
      .send(serializedBody);
  }

  return outgoingRequest;
}

const apiClient = {
  get(path, { query, headers: extraHeaders } = {}) {
    return send('GET', withQuery(path, query), undefined, extraHeaders);
  },

  post(path, body, { headers: extraHeaders } = {}) {
    return send('POST', path, body, extraHeaders);
  },

  put(path, body, { headers: extraHeaders } = {}) {
    return send('PUT', path, body, extraHeaders);
  },

  patch(path, body, { headers: extraHeaders } = {}) {
    return send('PATCH', path, body, extraHeaders);
  },

  del(path, { headers: extraHeaders } = {}) {
    return send('DELETE', path, undefined, extraHeaders);
  }
};

module.exports = apiClient;
