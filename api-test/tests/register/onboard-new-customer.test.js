const { createVerifiedCustomer } = require('../../utilities/createCustomer');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Onboard New Customer with Referral Code', function () {

  test('should onboard a new customer with referral code RZKZEZV5', async function () {
    const result = await createVerifiedCustomer(baseUrl, {
      referral_code: 'RZKZEZV5'
    });

    expect(result.response.status).toBe(true);
    expect(result.response.message).toBe('User registered successfully');
    expect(result.response.data).toHaveProperty('token');
    expect(result.response.data).toHaveProperty('user');
    expect(result.user.email).toBe(result.payload.email);
    expect(result.payload.referral_code).toBe('RZKZEZV5');
  });

});
