const request = require('supertest');
const PhoneNumberGenerator = require('../../test-data/PhoneNumberGenerator');
const { PHONEVERIFICATION, STATUS } = require('../../test-data/constants');

let baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/v1';
if (!baseUrl.endsWith('/')) baseUrl += '/';

const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Phone Verification - Send OTP', () => {
    const targetCountries = [
        'Nigeria',
        'Canada',
        'United States',
        'France',
        'Italy',
        'United Kingdom'
    ];

    test('should send OTP successfully to the five available countries', async () => {
        for (const country of targetCountries) {

            const phoneNumber = PhoneNumberGenerator.generatePhoneNumber(country);
            const response = await request(baseUrl)
                .post(PHONEVERIFICATION.SEND_OTP)
                .send({ phone: phoneNumber });

            expect(response.status).toBe(STATUS.OK);
            expect(response.body.message).toBe('OTP sent successfully');
        }
    });

    test('should return UNPROCESSABLE_ENTITY when phone is missing', async () => {
        const response = await request(baseUrl)
            .post(PHONEVERIFICATION.SEND_OTP)
            .send({ phone: '' });

        expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return UNPROCESSABLE_ENTITY for invalid phone format', async () => {
        const response = await request(baseUrl)
            .post(PHONEVERIFICATION.SEND_OTP)
            .send({ phone: '12345' });

        expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });

    test('should return UNPROCESSABLE_ENTITY when request payload is malformed', async () => {
        const response = await request(baseUrl)
            .post(PHONEVERIFICATION.SEND_OTP)
            .send({ invalidField: 'invalid' });

        expect(response.status).toBe(STATUS.UNPROCESSABLE);
    });
});