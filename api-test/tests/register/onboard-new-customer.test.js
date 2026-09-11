const request = require('supertest');
const { COUNTRY_ID, STATUS, USER, SWAP_DEAL, BLAAIZ_COLLECTION, TRANSACTION_PIN } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const { createSwapDeal } = require('../../utilities/createSwapDeal');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

const REFEREE_COUNTRIES = [COUNTRY_ID.CANADA, COUNTRY_ID.USA, COUNTRY_ID.FRANCE,COUNTRY_ID.UK];
const COUNTRY_NAMES = {
  [COUNTRY_ID.CANADA]: 'Canada',
  [COUNTRY_ID.USA]: 'USA',
  [COUNTRY_ID.FRANCE]: 'France',
  [COUNTRY_ID.UK]: 'UK'
};
const TEST_PIN = '3322';

describeOrSkip('Onboard New Customers with Referral Code and Perform Transactions', function () {

  let referrerCustomer = null;
  const referees = [];

  test('should create a new customer (referrer)', async function () {
    referrerCustomer = await createVerifiedCustomer(baseUrl, {
      residence_country_id: COUNTRY_ID.USA
    }, { kycLevel: 'level-two' });

    expect(referrerCustomer.response.status).toBe(true);
    expect(referrerCustomer.response.message).toBe('User registered successfully');
    expect(referrerCustomer.token).toBeTruthy();
    expect(referrerCustomer.deviceToken).toBeTruthy();

    console.log('--- Referrer Customer ---');
    console.log('Token:', referrerCustomer.token);
    console.log('Device Token:', referrerCustomer.deviceToken);
  });

  test('should extract referral code from referrer profile', async function () {
    const response = await request(baseUrl)
      .get(USER.PROFILE)
      .set('Authorization', `Bearer ${referrerCustomer.token}`)
      .set('SS-Device-Token', referrerCustomer.deviceToken)
      .set('userAgent', 'api-test');

    expect(response.status).toBe(STATUS.OK);
    console.log(JSON.stringify(response.body));
    expect(response.body.data).toHaveProperty('referral_code');

    referrerCustomer.referralCode = response.body.data.referral_code;
    console.log('Referrer Referral Code:', referrerCustomer.referralCode);
  });

  // for (let i = 0; i < REFEREE_COUNTRIES.length; i++) {

  //   test(`referee ${i + 1}: should onboard using referrer referral code`, async function () {

  //     console.log('------------------------------------------------------New user--------------------------------------------------------------------------------')

  //     // const referralCode = 'EFE'; // Use a static referral code for testing
  //     const referralCode = referrerCustomer.referralCode; 

  //     const referee = await createVerifiedCustomer(baseUrl, {
  //       // referral_code: referrerCustomer.referralCode,
  //       referral_code: referralCode,
  //       residence_country_id: REFEREE_COUNTRIES[i]
  //     }, { kycLevel: 'level-two' });

    
  //     // console.log("REFEREE: ",JSON.stringify(referee, null, 2));
  //     expect(referee.response.status).toBe(true);
  //     expect(referee.response.message).toBe('User registered successfully');
  //     expect(referee.token).toBeTruthy();
  //     expect(referee.deviceToken).toBeTruthy();
  //     expect(referee.payload.referral_code).toBe(referralCode);
  //     // expect(referee.payload.referral_code).toBe(referrerCustomer.referralCode);

  //     referees.push(referee);

  //     console.log(`--- Referee ${i + 1} Customer ---`);
  //     console.log('Token:', referee.token);
  //     console.log('Device Token:', referee.deviceToken);
  //     // console.log('Email:', referee.payload.email, 'Residence Country ID:', referee.payload.residence_country_id);
  //     console.log('Email:', referee.payload.email, 'Residence Country:', COUNTRY_NAMES[referee.payload.residence_country_id] || referee.payload.residence_country_id);
  //     // console.log('Referral Code Used:', referee.payload.referral_code);
  //   });

  //   test(`referee ${i + 1}: should create a transaction pin`, async function () {
  //     const referee = referees[i];

  //     const response = await request(baseUrl)
  //       .post(TRANSACTION_PIN.CREATE)
  //       .set('Authorization', `Bearer ${referee.token}`)
  //       .set('SS-Device-Token', referee.deviceToken)
  //       .set('userAgent', 'api-test')
  //       .send({ pin: TEST_PIN, pin_confirmation: TEST_PIN });

  //     expect(response.status).toBe(STATUS.OK);

  //     // console.log(`--- Referee ${i + 1} Create Transaction Pin ---`);
  //     // console.log('Status:', response.status);
  //     // console.log('Body:', response.body);
  //   });

  //   test(`referee ${i + 1}: should create a swap deal`, async function () {
  //     const referee = referees[i];
  //     const swapDealId = await createSwapDeal(baseUrl, referee, 150);

  //     expect(swapDealId).toBeTruthy();
  //     referee.swapDealId = swapDealId;

  //     // console.log(`--- Referee ${i + 1} Swap Deal ---`);
  //     // console.log('Swap Deal ID:', swapDealId);
  //   });

  //   test(`referee ${i + 1}: should verify transaction pin`, async function () {
  //     const referee = referees[i];

  //     const response = await request(baseUrl)
  //       .post(TRANSACTION_PIN.VERIFY)
  //       .set('Authorization', `Bearer ${referee.token}`)
  //       .set('SS-Device-Token', referee.deviceToken)
  //       .set('userAgent', 'api-test')
  //       .send({ pin: TEST_PIN, swap_deal_id:  referee.swapDealId});

  //     // console.log("VERIFY PIN: ",JSON.stringify(response.body, null, 2));
  //     expect(response.status).toBe(STATUS.OK);

  //     referee.dealScopedToken = response.body.data?.token || referee.token;

  //     // console.log(`--- Referee ${i + 1} Verify Transaction Pin ---`);
  //     // console.log('Status:', response.status);
  //     // console.log('Body:', response.body);
  //   });

  //   test(`referee ${i + 1}: should confirm payment via i-have-made-this-payment`, async function () {
  //     const referee = referees[i];
  //     const paymentRef = 'PAY-REF-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);

  //     await request(baseUrl)
  //       .get(BLAAIZ_COLLECTION(100, paymentRef));

  //     const response = await request(baseUrl)
  //       .post(SWAP_DEAL.I_HAVE_MADE_THIS_PAYMENT(referee.swapDealId))
  //       .set('Authorization', `Bearer ${referee.dealScopedToken}`)
  //       .set('SS-Device-Token', referee.deviceToken)
  //       .set('userAgent', 'api-test')
  //       .send({
  //         reference: paymentRef
  //       });

  //     // console.log("I HAVE MADE THIS PAYMENT: ",JSON.stringify(response.body, null, 2));
  //     expect(response.status).toBe(STATUS.OK);

  //     // console.log(`--- Referee ${i + 1} I Have Made This Payment ---`);
  //     // console.log('Status:', response.status);
  //     // console.log('Body:', response.body);
  //   });

  //   test(`referee ${i + 1}: should verify transaction status is complete`, async function () {
  //     const referee = referees[i];

  //     const response = await request(baseUrl)
  //       .get(SWAP_DEAL.TRANSACTION_STATUS(referee.swapDealId))
  //       .set('Authorization', `Bearer ${referee.dealScopedToken}`)
  //       .set('SS-Device-Token', referee.deviceToken)
  //       .set('userAgent', 'api-test');

  //     expect(response.status).toBe(STATUS.OK);
  //     expect(response.body).toHaveProperty('data');

  //     // console.log(`--- Referee ${i + 1} Transaction Status ---`);
  //     // console.log('Status:', response.status);
  //     // console.log('Body:', response.body);
  //   });

  // }

});
