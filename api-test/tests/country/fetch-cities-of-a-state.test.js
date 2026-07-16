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

describeOrSkip('Country API - Fetch Cities of a Country', () => {

  describe('Endpoint Availability', () => {

    test('should return 404 — cities endpoint is not available by country ID', async () => {
      const response = await request(baseUrl).get(COUNTRY.GET_CITIES_BY_COUNTRY(COUNTRY_ID.USA)).set(getCommonHeaders());

      expect(response.status).toBe(STATUS.NOT_FOUND);
    });

  });

});