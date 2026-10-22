const { createHash, createHmac, randomUUID } = require('crypto');
const config = require('../config/config');

function signingKey() {
  const encodedKey = config.signingKeyBase64.trim();
  if (!encodedKey) {
    throw new Error('ROUTELINK_SIGNING_KEY_BASE64 is required for signed API requests.');
  }
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(encodedKey)) {
    throw new Error('ROUTELINK_SIGNING_KEY_BASE64 must be a valid base64 value.');
  }

  const key = Buffer.from(encodedKey, 'base64');
  if (!key.length || key.toString('base64').replace(/=+$/, '') !== encodedKey.replace(/=+$/, '')) {
    throw new Error('ROUTELINK_SIGNING_KEY_BASE64 must be a valid base64 value.');
  }
  return key;
}

function signedHeaders(method, pathAndQuery, body) {
  const upperMethod = method.toUpperCase();
  const timestamp = Date.now().toString();
  const idempotencyKey = ['POST', 'PUT', 'PATCH'].includes(upperMethod)
    ? randomUUID()
    : '';
  const serializedBody = body === undefined ? '' : JSON.stringify(body);
  const bodyHash = createHash('sha512').update(serializedBody).digest('hex');
  const canonical = [
    upperMethod,
    pathAndQuery,
    timestamp,
    idempotencyKey,
    bodyHash
  ].join('\n');
  const signature = createHmac('sha512', signingKey())
    .update(canonical)
    .digest('base64');

  const headers = {
    signature,
    'X-Request-Timestamp': timestamp
  };
  if (idempotencyKey) {
    headers['Idempotency-Key'] = idempotencyKey;
  }

  return { headers, serializedBody };
}

module.exports = { signedHeaders };
