const request = require('supertest');
const authDataStore = require('./AuthDataStore');

let BASE_URL = process.env.BASE_URL || 'http://localhost:3000/api/v1/';
if (!BASE_URL.endsWith('/')) BASE_URL += '/';

function headers(role) {
  const h = { Accept: 'application/json' };
  if (role) {
    const token = authDataStore.getToken(role);
    if (token) h.Authorization = `Bearer ${token}`;
  }
  return h;
}

function api() {
  return request(BASE_URL);
}

const apiClient = {
  get(path, { role, query, headers: extraHeaders } = {}) {
    const req = api().get(path).set({ ...headers(role), ...extraHeaders });
    if (query) req.query(query);
    return req;
  },

  post(path, body, { role, headers: extraHeaders } = {}) {
    return api()
      .post(path)
      .set({ ...headers(role), ...extraHeaders })
      .send(body);
  },

  put(path, body, { role, headers: extraHeaders } = {}) {
    return api()
      .put(path)
      .set({ ...headers(role), ...extraHeaders })
      .send(body);
  },

  patch(path, body, { role, headers: extraHeaders } = {}) {
    return api()
      .patch(path)
      .set({ ...headers(role), ...extraHeaders })
      .send(body);
  },

  del(path, { role, headers: extraHeaders } = {}) {
    return api()
      .delete(path)
      .set({ ...headers(role), ...extraHeaders });
  },

  raw() {
    return api();
  }
};

module.exports = apiClient;
