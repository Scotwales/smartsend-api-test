const request = require('supertest');
const chai = require('chai');
const { STATUS, SWAP_DEAL, BLAAIZ_COLLECTION } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { createSwapDeal } = require('../../utilities/createSwapDeal');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

let testCustomer = null;
let swapDealId = null;
const paymentRef = 'PAY-REF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

describeOrSkip('I Have Made This Payment', function() {

  beforeAll(async function() {
    testCustomer = await createVerifiedCustomer(baseUrl);
    swapDealId = await createSwapDeal(baseUrl, testCustomer);
  });

  describe('Happy Path', function() {

    test('should confirm payment for a valid swap deal', async function() {
      chai.expect(swapDealId, 'swap deal should have been created').to.be.ok;

      await request(baseUrl)
        .get(BLAAIZ_COLLECTION(100, paymentRef));

      const response = await request(baseUrl)
        .post(SWAP_DEAL.I_HAVE_MADE_THIS_PAYMENT(swapDealId))
        .set('Authorization', `Bearer ${testCustomer.token}`)
        .set('SS-Device-Token', testCustomer.deviceToken)
        .set('userAgent', 'api-test')
        .send({
          reference: paymentRef,
          bank_name: 'Test Bank',
          account_name: 'John Doe',
          sender_email: testCustomer.payload.email,
          sender_bank_routing_number: '021000021'
        });

      chai.expect(response.status, 'expected 200 when payment is confirmed').to.equal(STATUS.OK);
    });

  });

  describe('Negative Cases - Authorization Errors', function() {

    test('should return 401 without auth token', async function() {
      const response = await request(baseUrl)
        .post(SWAP_DEAL.I_HAVE_MADE_THIS_PAYMENT(1))
        .set('userAgent', 'api-test')
        .send({});

      chai.expect(response.status, 'expected 401 without auth token').to.equal(STATUS.UNAUTHORIZED);
    });

  });

});
