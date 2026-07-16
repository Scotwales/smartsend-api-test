const request = require('supertest');
const { STATUS, SWAP_DEAL, COUNTRY_ID } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
let sourceCurrencyId = null;
let sourceCurrencyCode = null;
let destinationCurrencyId = null;
let destinationCurrencyCode = null;
let swapDealId = null;
let exchangeRate = null;
const SEND_AMOUNT = 100;

function findCurrencyByCode(data, code) {
  return data.find(c => c.code.toUpperCase() === code.toUpperCase());
}

describeOrSkip('CAD to NGN Swap - Business Logic', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl, { residence_country_id: COUNTRY_ID.USA });

    const srcResponse = await request(baseUrl)
      .get(SWAP_DEAL.SOURCE_CURRENCIES)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(srcResponse.status).toBe(STATUS.OK);
    const cadCurrency = findCurrencyByCode(srcResponse.body.data, 'CAD');
    expect(cadCurrency).toBeTruthy();
    sourceCurrencyId = cadCurrency.id;
    sourceCurrencyCode = cadCurrency.code;

    console.log('SS-Device-Token:', testCustomer.deviceToken);
    console.log('Authorization Token:', testCustomer.token);

    
    const destResponse = await request(baseUrl)
      .get(SWAP_DEAL.DESTINATION_CURRENCIES(sourceCurrencyId))
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(destResponse.status).toBe(STATUS.OK);
    const ngnCurrency = findCurrencyByCode(destResponse.body.data, 'NGN');
    expect(ngnCurrency).toBeTruthy();
    destinationCurrencyId = ngnCurrency.id;
    destinationCurrencyCode = ngnCurrency.code;
  });

  test('should initiate swap deal from CAD to NGN and validate converted amount', async function() {
    const response = await request(baseUrl)
      .post(SWAP_DEAL.INITIATE)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test')
      .send({
        source_currency: sourceCurrencyId,
        destination_currency: destinationCurrencyId,
        amount: SEND_AMOUNT
      });

    expect(response.status).toBe(STATUS.OK);
    expect(response.body).toHaveProperty('data');
    expect(response.body.data).toHaveProperty('exchange_rate');
    expect(response.body.data).toHaveProperty('reciever_gets');

    const rate = parseFloat(response.body.data.exchange_rate);
    expect(rate).toBeGreaterThan(0);
    exchangeRate = rate;
  });

  test('should fetch bank list', async function() {
    const response = await request(baseUrl)
      .get(SWAP_DEAL.BANK_LIST)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(response.status).toBe(STATUS.OK);
    expect(response.body).toHaveProperty('data');
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test('should verify account name enquiry', async function() {
    const response = await request(baseUrl)
      .post(SWAP_DEAL.ACCOUNT_NAME_ENQUIRY)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test')
      .send({
        bank_code: '001',
        account_number: '1234567890'
      });

    expect(response.status).toBe(STATUS.OK);
    expect(response.body).toHaveProperty('data');
  });

  test('should fetch transaction limit', async function() {
    const response = await request(baseUrl)
      .get(SWAP_DEAL.TRANSACTION_LIMIT)
      .set('Authorization', `Bearer ${testCustomer.token}`)
      .set('SS-Device-Token', testCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(response.status).toBe(STATUS.OK);
    expect(response.body).toHaveProperty('data');
  });

});
