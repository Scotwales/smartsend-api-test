const request = require('supertest');
const { COUNTRY, STATUS } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';

const runIntegration = !!baseUrl;
const describeOrSkip = runIntegration ? describe : describe.skip;

function getPhoneCodeByCountryName(data = [], countryName) {
  const country = data.find(item => item.name.toLowerCase() === countryName.toLowerCase());
  return country ? country.phone_code : null;
}

describeOrSkip('Country API - Fetch countries', () => {

  test('should fetch countries successfully', async () => {
  const response = await request(baseUrl)
      .get(COUNTRY.FETCH_COUNTRIES)
      .set(getCommonHeaders())
      .query({
        country_type: 'resident'
    });

    expect(response.status).toBe(STATUS.OK);
    
  });

  test('should support resident country_type query filter and return a list', async () => {
    const response = await request(baseUrl)
      .get(COUNTRY.FETCH_COUNTRIES)
      .query({ country_type: 'resident', size: 10, page: 1 });

    expect(response.status).toBe(STATUS.OK);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should extract phone_code by country name from response data', async () => {
    const response = await request(baseUrl)
      .get(COUNTRY.FETCH_COUNTRIES)
      .query({ country_type: 'resident', size: 10, page: 1 });

    expect(response.status).toBe(STATUS.OK);
    expect(Array.isArray(response.body.data)).toBe(true);

    const canadaPhoneCode = getPhoneCodeByCountryName(response.body.data, 'Canada');
    expect(canadaPhoneCode).toBe('+1');

    const italyPhoneCode = getPhoneCodeByCountryName(response.body.data, 'Italy');
    expect(italyPhoneCode).toBe('+39');

    const unitedStatesPhoneCode = getPhoneCodeByCountryName(response.body.data, 'United States');
    expect(unitedStatesPhoneCode).toBe('+1');

    const unitedKingdomPhoneCode = getPhoneCodeByCountryName(response.body.data, 'United Kingdom');
    expect(unitedKingdomPhoneCode).toBe('+44');

     const francePhoneCode = getPhoneCodeByCountryName(response.body.data, 'France');
    expect(francePhoneCode).toBe('+33');

  });

});
