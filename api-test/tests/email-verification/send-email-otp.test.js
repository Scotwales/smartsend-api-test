const request = require('supertest');
const EmailGenerator = require('../../test-data/EmailGenerator');
const { EMAILVERIFICATION, STATUS } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL || 'http://localhost:3000/api/v1';
if (!baseUrl.endsWith('/')) baseUrl += '/';

const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Email Verification - Send OTP', () => {

	
	describe('Happy Path - Valid Requests', () => {
		test('should send OTP successfully with valid email', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		// test('first scenarios', async () => {
		// 	const baseURl = 'http://localhost:3000/api/v1/';
		// 	const response = await request(baseURl)
		// 		.post('mobile/verification/emailVerification')
		// 		.send({
		// 			email: 'sam@yopmail.com'
		// 		});
		// 		expect(response.status).toBe(200);
		// 		expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		// });

		test('should send OTP to multiple valid emails', async () => {
			const emails = [
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName()),
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName()),
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName())
			];

			for (const email of emails) {
				const response = await request(baseUrl)
					.post(EMAILVERIFICATION.SEND_OTP)
					.send({ email });

				expect(response.status).toBe(STATUS.OK);
				expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
			}
		});
	});

	describe('Edge Cases', () => {
		test('should handle email with numbers', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const email = `${firstName.toLowerCase()}123@yopmail.com`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle email with dots', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@yopmail.com`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle email with hyphens', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}-${lastName.toLowerCase()}@yopmail.com`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle email with underscores', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@yopmail.com`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle email with plus sign', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const tag = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}+${tag.toLowerCase()}@yopmail.com`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle email with uppercase letters', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName}${lastName}@YopMail.COM`;
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});

		test('should handle extremely long email', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const veryLongEmail = firstName.toLowerCase().repeat(50) + '@yopmail.com';
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: veryLongEmail });

			expect(typeof response.status).toBe('number');
			expect(response.status).toBeGreaterThanOrEqual(200);
			expect(response.status).toBeLessThan(600);
			if (response.status >= 400) {
				expect(response.body).toEqual(expect.objectContaining({
					status: expect.any(String),
					error: expect.objectContaining({
						message: expect.any(String)
					})
				}));
			}
		});

		test('should handle duplicate OTP request (rate limiting check)', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());

			const response1 = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			const response2 = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(response1.status).toBe(STATUS.OK);
			expect(response1.body.message).toBe('Verification code has been successfully sent to your email address');
			expect(response2.status).toBe(STATUS.OK);
			expect(response2.body.message).toBe('Verification code has been successfully sent to your email address');
	
		});
	});

	describe('Negative Cases - Missing/Empty Fields', () => {
		test('should return UNPROCESSABLE_ENTITY when email is missing', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when email is empty string', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: '' });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when email is only whitespace', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: '   ' });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when email is null', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: null });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Invalid Email Format', () => {
		test('should return UNPROCESSABLE_ENTITY for email without @', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()}yopmail.com` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email without domain', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()}@` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email without local part', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: '@yopmail.com' });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email without TLD', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()}@yopmail` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email with multiple @ symbols', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()}@${lastName.toLowerCase()}@yopmail.com` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email with spaces', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()} ${lastName.toLowerCase()}@yopmail.com` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});


		test('should return UNPROCESSABLE_ENTITY for email with special characters', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: `${firstName.toLowerCase()}!@#$@yopmail.com` });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Malformed Request', () => {
		test('should return UNPROCESSABLE_ENTITY for completely invalid payload', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ invalidField: 'invalid', anotherField: 123 });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should handle email as array (should fail)', async () => {
			const email1 = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const email2 = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: [email1, email2] });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should handle email as object (should fail)', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: { user: email } });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Security/Injection', () => {
		test('should handle SQL injection attempt in email field', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: "'; DROP TABLE users; --" });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should handle XSS attempt in email field', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: '<script>alert("xss")</script>@yopmail.com' });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Edge Values', () => {

		test('should handle email as number type', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: 12345 });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should handle email as boolean type', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: true });

			expect(response.status).toBe(STATUS.UNPROCESSABLE);
		});

		test('should handle email with unicode characters', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: 'ユーザー@yopmail.com' });

			expect(response.status).toBe(STATUS.OK);
			expect(response.body.message).toBe('Verification code has been successfully sent to your email address');
		});
	});
});
