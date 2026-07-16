const request = require('supertest');
const EmailGenerator = require('../../test-data/EmailGenerator');
const { EMAILVERIFICATION, STATUS, OTP } = require('../../test-data/constants');
const { getCommonHeaders } = require('../../utilities/testHeaders');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';

const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// Helper: generates a random valid 6-digit numeric OTP string
function generateValidOTP() {
	return String(Math.floor(100000 + Math.random() * 900000));
}

const VALID_OTP = '123456';

describeOrSkip('Email Verification - Verify OTP', () => {

	describe('Happy Path - Valid Requests', () => {
		test('should verify email successfully after sending OTP', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			
			// First, send OTP to email
			const sendResponse = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });
			
			expect(sendResponse.status).toEqual(STATUS.OK);

			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			// Then attempt to verify with a code
			const verifyResponse = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: OtpCode });

			expect(verifyResponse.status).toBe(STATUS.OK);
			expect(verifyResponse.body).toHaveProperty('message');
		});

		test('should verify OTP for multiple emails after sending OTP to each', async () => {
			const emails = [
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName()),
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName()),
				EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName())
			];

			for (const email of emails) {
				const sendResponse = await request(baseUrl)
					.post(EMAILVERIFICATION.SEND_OTP)
					.send({ email });

				expect(sendResponse.status).toEqual(STATUS.OK);

				const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      			const OtpCode = OtpResponse.body.data.otp;

				const verifyResponse = await request(baseUrl)
					.post(EMAILVERIFICATION.VERIFY_OTP)
					.send({ email, code: OtpCode });

				expect(verifyResponse.status).toBe(STATUS.OK);
			}
		});

		test('should invalidate old OTP when a new OTP is dispatched', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			
			// Send first email OTP
			const firstSend = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email : email });

			expect(firstSend.status).toBe(STATUS.OK);

			// Capture first OTP
			const firstOtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

			const firstOtpCode = firstOtpResponse.body.data.otp;

			// Wait for cooldown to expire before resending to the same number
			await new Promise(resolve => setTimeout(resolve, 2000));

			// Send second OTP — this should invalidate the first
			const secondSend = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email: email });

			expect(secondSend.status).toBe(STATUS.OK);

			// Then attempt to verify with a code
			const verifyResponse = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: firstOtpCode });

			expect(verifyResponse.status).toBe(STATUS.UNPROCESSABLE);
		});
	});

	describe('Edge Cases', () => {
		test('should handle verification with email containing dots', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@yopmail.com`;

			await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: OtpCode });

			expect(response.status).toBe(STATUS.OK);
		});

		test('should handle verification with email containing underscores', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName.toLowerCase()}_${lastName.toLowerCase()}@yopmail.com`;

			await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: OtpCode });

			expect(response.status).toBe(STATUS.OK);
		});

		test('should handle verification with uppercase email', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const email = `${firstName}${lastName}@YopMail.COM`;

			await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });
			
			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: OtpCode });

			expect(response.status).toBe(STATUS.OK);
		});

		test('should handle code as numeric type', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());

			await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });
			
			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: OtpCode });

			expect(response.status).toBe(STATUS.OK);
		});
	});

	describe('Negative Cases - Missing/Empty Fields', () => {
		test('should return UNPROCESSABLE_ENTITY when email is missing', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
			expect(response.body).toHaveProperty('errors');
		});

		test('should return UNPROCESSABLE_ENTITY when code is missing', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when both email and code are missing', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({});

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when email is empty string', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: '', code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when code is empty string', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: '' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when email is null', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: null, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY when code is null', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: null });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Invalid Email Format', () => {
		test('should return UNPROCESSABLE_ENTITY for email without @', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: `${firstName.toLowerCase()}yopmail.com`, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email without domain', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: `${firstName.toLowerCase()}@`, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email with multiple @ symbols', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: `${firstName.toLowerCase()}@${lastName.toLowerCase()}@yopmail.com`, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for email with spaces', async () => {
			const firstName = EmailGenerator.getRandomFirstName();
			const lastName = EmailGenerator.getRandomLastName();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: `${firstName.toLowerCase()} ${lastName.toLowerCase()}@yopmail.com`, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Invalid Code Format', () => {
		test('should return UNPROCESSABLE_ENTITY for code that is too short', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: '123' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for code with letters', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: 'ABCDEF' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for code with special characters', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: '12#@34' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should return UNPROCESSABLE_ENTITY for code with spaces', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: '123 456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Malformed Request', () => {
		test('should return UNPROCESSABLE_ENTITY for completely invalid payload', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ invalidField: 'invalid', anotherField: 123 });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle email as array', async () => {
			const email1 = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const email2 = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: [email1, email2], code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle code as array', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: ['123456', '654321'] });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle email as object', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: { user: email }, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Security/Injection', () => {
		test('should handle SQL injection attempt in email field', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: "'; DROP TABLE users; --", code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle XSS attempt in email field', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: '<script>alert("xss")</script>@yopmail.com', code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle SQL injection attempt in code field', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: "123456'; DROP TABLE--" });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Type Mismatches', () => {
		test('should handle email as number type', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: 12345, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle email as boolean type', async () => {
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email: true, code: '123456' });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});

		test('should handle code as boolean type', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: false });

			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
		});
	});

	describe('Negative Cases - Invalid/Expired OTP', () => {
		test('should return error for incorrect OTP code', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			const wrongCode = generateValidOTP();
			const response = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ email, code: wrongCode });



			expect(response.status).toEqual(STATUS.UNPROCESSABLE);
			expect(response.body.error.message).toBe("Invalid verification code, please double check and try again");
		});

		test('should return error for already-used OTP', async () => {
			const email = EmailGenerator.getRandomEmail(EmailGenerator.getRandomFirstName());
			

			// Send OTP to email first
			const sendOTP = await request(baseUrl)
				.post(EMAILVERIFICATION.SEND_OTP)
				.send({ email });

			expect(sendOTP.status).toBe(STATUS.OK);

			// View OTP
			const OtpResponse = await request(baseUrl)
				.post(OTP.VIEW_OTP)
				.send({ type: 'email', email: email });

      		const OtpCode = OtpResponse.body.data.otp;

			// First verification attempt
			const response1 = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ 
					email: email, 
					code: OtpCode });

			expect(response1.status).toBe(STATUS.OK);
			expect(response1.body.message).toBe("Email address verified successfully");
			
			// Second verification attempt with same code
			const response2 = await request(baseUrl)
				.post(EMAILVERIFICATION.VERIFY_OTP)
				.send({ 
					email: email, 
					code: OtpCode });

			expect(response2.status).toEqual(STATUS.UNPROCESSABLE);
			expect(response2.body.error.message).toBe("Invalid verification code, please double check and try again");

		});
	});
});