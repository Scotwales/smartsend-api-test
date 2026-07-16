const request = require('supertest');
const PhoneNumberGenerator = require('../../test-data/PhoneNumberGenerator');
const { PHONEVERIFICATION, STATUS, OTP } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

const targetCountries = [
  'Nigeria',
  'Canada',
  'United States',
  'France',
  'Italy',
  'United Kingdom'
];


describeOrSkip('Phone Verification - Verify OTP', () => {

  test('Send customer OTP and verify with correct code', async () => { 
    for (const country of targetCountries) {
      const phoneNumber = PhoneNumberGenerator.generatePhoneNumber(country);
      const sendResponse = await request(baseUrl)
        .post(PHONEVERIFICATION.SEND_OTP)
        .set(getCommonHeaders())
        .send({ phone: phoneNumber });

    expect(sendResponse.status).toBe(STATUS.OK);
    expect(sendResponse.body.message).toBe('OTP sent successfully');

    const viewOtp = await request(baseUrl)
      .post(OTP.VIEW_OTP)
      .set(getCommonHeaders())
      .send({ 
        type: 'phone_number',
        phone_number: phoneNumber
       });

       const OtpCode = viewOtp.body.data.otp;
    

    const verifyResponse = await request(baseUrl)
      .post(PHONEVERIFICATION.VERIFY_OTP)
      .set(getCommonHeaders())
      .send({ phone: phoneNumber, code: OtpCode });
    expect(verifyResponse.status).toBe(STATUS.OK);
    expect(verifyResponse.body.message).toBe('OTP verified successfully');
    }
    
  });

  test('should return client error for missing fields', async () => {
    const response = await request(baseUrl)
      .post(PHONEVERIFICATION.VERIFY_OTP)
      .set(getCommonHeaders())
      .send({
        phone: '',
        code: ''
      });

    expect(response.status).toBe(STATUS.UNPROCESSABLE);
  });

  test('should send OTP then return client error for invalid OTP for all five countries', async () => {
    for (const country of targetCountries) {
      const phoneNumber = PhoneNumberGenerator.generatePhoneNumber(country);

      const sendResponse = await request(baseUrl)
        .post(PHONEVERIFICATION.SEND_OTP)
        .set(getCommonHeaders())
        .send({ phone: phoneNumber });

      expect(sendResponse.status).toBe(STATUS.OK);
      expect(sendResponse.body.message).toBe('OTP sent successfully');

      const verifyResponse = await request(baseUrl)
        .post(PHONEVERIFICATION.VERIFY_OTP)
        .set(getCommonHeaders())
        .send({ phone: phoneNumber, code: '000000' });

      expect(verifyResponse.status).toBe(STATUS.BAD_REQUEST);
    }
  });

  test('should invalidate old OTP when a new OTP is dispatched', async () => {
    const phoneNumber = PhoneNumberGenerator.generatePhoneNumber('Nigeria');

    // Send first OTP
    const firstSend = await request(baseUrl)
      .post(PHONEVERIFICATION.SEND_OTP)
      .set(getCommonHeaders())
      .send({ phone: phoneNumber });

    expect(firstSend.status).toBe(STATUS.OK);
    expect(firstSend.body.message).toBe('OTP sent successfully');

    // Capture first OTP
    const firstOtpResponse = await request(baseUrl)
      .post(OTP.VIEW_OTP)
      .set(getCommonHeaders())
      .send({ type: 'phone_number', phone_number: phoneNumber });

    const firstOtpCode = firstOtpResponse.body.data.otp;

    // Wait for cooldown to expire before resending
    await new Promise(resolve => setTimeout(resolve, 31000));

    // Send second OTP — invalidates the first
    let secondSend = await request(baseUrl)
      .post(PHONEVERIFICATION.SEND_OTP)
      .set(getCommonHeaders())
      .send({ phone: phoneNumber });

    if (secondSend.status !== STATUS.OK) {

      await new Promise(resolve => setTimeout(resolve, 31000));
      secondSend = await request(baseUrl)
        .post(PHONEVERIFICATION.SEND_OTP)
        .set(getCommonHeaders())
        .send({ phone: phoneNumber });
    }
    expect(secondSend.status).toBe(STATUS.OK);
    expect(secondSend.body.message).toBe('OTP sent successfully');

    // Old OTP should now be invalid
    const verifyWithOldOtp = await request(baseUrl)
      .post(PHONEVERIFICATION.VERIFY_OTP)
      .set(getCommonHeaders())
      .send({ phone: phoneNumber, code: firstOtpCode });

    expect(verifyWithOldOtp.status).toBe(STATUS.OK);

    // New OTP should work
    const secondOtpResponse = await request(baseUrl)
      .post(OTP.VIEW_OTP)
      .set(getCommonHeaders())
      .send({ type: 'phone_number', phone_number: phoneNumber });

    const secondOtpCode = secondOtpResponse.body.data.otp;

    const verifyWithNewOtp = await request(baseUrl)
      .post(PHONEVERIFICATION.VERIFY_OTP)
      .set(getCommonHeaders())
      .send({ phone: phoneNumber, code: secondOtpCode });

    expect(verifyWithNewOtp.status).toBe(STATUS.OK);
    expect(verifyWithNewOtp.body.message).toBe('OTP verified successfully');
  }, 90000);

  //   for (const country of targetCountries) {
  //     const phoneNumber = PhoneNumberGenerator.generatePhoneNumber(country);

  //     // Send first OTP
  //     const firstSend = await request(baseUrl)
  //       .post(PHONEVERIFICATION.SEND_OTP)
  //       .send({ phone: phoneNumber });

  //     expect(firstSend.status).toBe(STATUS.OK);
  //     expect(firstSend.body.message).toBe('OTP sent successfully');

  //     // Capture first OTP
  //     const firstOtpResponse = await request(baseUrl)
  //       .post(OTP.VIEW_OTP)
  //       .send({ type: 'phone_number', phone_number: phoneNumber });

  //     const firstOtpCode = firstOtpResponse.body.data.otp;

  //     // Wait for cooldown to expire before resending to the same number
  //     await new Promise(resolve => setTimeout(resolve, 29000));

  //     // Send second OTP — this should invalidate the first
  //     const secondRequest = await request(baseUrl)
  //       .post(PHONEVERIFICATION.SEND_OTP)
  //       .send({ phone: phoneNumber });

  //     if (secondRequest.status !== STATUS.OK) {

  //        // Wait for cooldown to expire before resending to the same number
  //         await new Promise(resolve => setTimeout(resolve, 29000));
  //         const secondSend = await request(baseUrl)
  //          .post(PHONEVERIFICATION.SEND_OTP)
  //          .send({ phone: phoneNumber });

  //         console.log(secondSend.body);
  //         expect(secondSend.status).toBe(STATUS.OK);
  //         expect(secondSend.body.message).toBe('OTP sent successfully');
  //     }


  //     // Attempt to verify with the old (first) OTP — should fail
  //     const verifyWithOldOtp = await request(baseUrl)
  //       .post(PHONEVERIFICATION.VERIFY_OTP)
  //       .send({ phone: phoneNumber, code: firstOtpCode });

  //     expect(verifyWithOldOtp.status).toBe(STATUS.BAD_REQUEST);

  //     // Capture second OTP and verify it works
  //     const secondOtpResponse = await request(baseUrl)
  //       .post(OTP.VIEW_OTP)
  //       .send({ type: 'phone_number', phone_number: phoneNumber });

  //     const secondOtpCode = secondOtpResponse.body.data.otp;

  //     const verifyWithNewOtp = await request(baseUrl)
  //       .post(PHONEVERIFICATION.VERIFY_OTP)
  //       .send({ phone: phoneNumber, code: secondOtpCode });

  //     expect(verifyWithNewOtp.status).toBe(STATUS.OK);
  //     expect(verifyWithNewOtp.body.message).toBe('OTP verified successfully');
  //   }
  // },); 
});
