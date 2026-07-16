const request = require('supertest');
const { COUNTRY, COUNTRY_ID, STATUS } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!baseUrl;
const describeOrSkip = runIntegration ? describe : describe.skip;

const ALL_COUNTRIES = [
  { name: 'Nigeria',        id: COUNTRY_ID.NIGERIA },
  { name: 'United States',  id: COUNTRY_ID.USA },
  { name: 'Canada',         id: COUNTRY_ID.CANADA },
  { name: 'France',         id: COUNTRY_ID.FRANCE },
  { name: 'United Kingdom', id: COUNTRY_ID.UK },
  { name: 'Italy',          id: COUNTRY_ID.ITALY },
];

describeOrSkip('Country API - Fetch States of a Country', () => {

  describe('Fetch States for All 5 Countries', () => {
    test.each(ALL_COUNTRIES)(
      'should fetch states successfully for $name',
      async ({ id }) => {
        const response = await request(baseUrl).get(COUNTRY.GET_STATES(id)).set(getCommonHeaders());

        expect(response.status).toBe(STATUS.OK);
        expect(response.body).toHaveProperty('message');
        expect(typeof response.body.message).toBe('string');
        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body.data.length).toBeGreaterThan(0);
      }
    );
  });

 
  describe('Happy Path - Valid Requests', () => {
    const validCountryId = COUNTRY_ID.USA;

    test('should return 200 with message and data fields', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES(validCountryId)).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
    });

    test('should return data as an array', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES(validCountryId)).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return a non-empty list of states', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES(validCountryId)).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    test('should return message as a string', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES(validCountryId)).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(typeof response.body.message).toBe('string');
    });
  });

  
  describe('Edge Cases', () => {
    // API returns 200 but resolves lowercase ULID to the same country — confirm it still works
    test('should return 200 with valid data for lowercase country ID', async () => {
      const response = await request(baseUrl)
        .get(COUNTRY.GET_STATES(COUNTRY_ID.USA.toLowerCase()))
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    // API returns 200 but an unknown numeric ID should yield empty data
    test('should return 200 with empty data for a numeric string ID that does not exist', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('000000')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

 
  describe('Negative Cases - Invalid Country ID', () => {
    test('should return 200 with empty data for a short non-existent string ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('XX')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 200 with empty data for a random string country ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('INVALID_COUNTRY')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 200 with empty data for a single character country ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('X')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 200 with empty data for an excessively long country ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('A'.repeat(100))).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

  
  describe('Negative Cases - Security/Injection', () => {
    // API returns 200 with no data for SQL injection (no validation layer)
    test('should return 200 with empty data for SQL injection attempt', async () => {
      const response = await request(baseUrl)
        .get(COUNTRY.GET_STATES("'; DROP TABLE countries; --"))
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    // API returns 404 when special chars break URL routing
    test('should return 404 for XSS attempt in country ID', async () => {
      const response = await request(baseUrl)
        .get(COUNTRY.GET_STATES('<script>alert("xss")</script>'))
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.NOT_FOUND);
    });

    // API returns 404 when path traversal alters the URL structure
    test('should return 404 for path traversal attempt in country ID', async () => {
      const response = await request(baseUrl)
        .get(COUNTRY.GET_STATES('../../etc/passwd'))
        .set(getCommonHeaders());

      expect(response.status).toBe(STATUS.NOT_FOUND);
    });
  });

  describe('Negative Cases - Special Characters', () => {
    test('should return 200 with empty data for special characters in country ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('N@G!')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 200 with empty data for country ID with spaces', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('N G')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });

    test('should return 200 with empty data for country ID with unicode characters', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_STATES('NÀG')).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.OK);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });

});