const request = require('supertest');
const fs = require('fs');
const path = require('path');
const { KYC, KYC_DOCUMENT_TYPE, COUNTRY_ID, STATUS } = require('../../test-data/constants');
const { createVerifiedCustomer } = require('../../utilities/createCustomer');
const PhoneNumberGenerator = require('../../test-data/PhoneNumberGenerator');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

// The full data URI can be supplied through the test environment without putting
// a large encoded document in the test source.
const SOURCE_OF_FUNDS_DOCUMENT = process.env.SOURCE_OF_FUNDS_DOCUMENT ||
	'data:application/pdf;base64,JVBERi0xLjQKMSAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKMiAwIG9iago8PC9UeXBlL1BhZ2VzL0tpZHNbMyAwIFJdL0NvdW50IDE+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDIgMCBSL01lZGlhQm94WzAgMCAzMDAgMzAwXS9Db250ZW50cyA0IDAgUj4+CmVuZG9iago0IDAgb2JqCjw8L0xlbmd0aCA0ND4+c3RyZWFtCkJUCjEwIDUwIFRkIChTb3VyY2Ugb2YgZnVuZHMgZG9jdW1lbnQpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDUKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMDkgMDAwMDAgbgowMDAwMDAwMDU4IDAwMDAwIG4KMDAwMDAwMDExNSAwMDAwMCBuCjAwMDAwMDAyMTQgMDAwMDAgbgp0cmFpbGVyCjw8L1Jvb3QgMSAwIFIvU2l6ZSA1Pj4Kc3RhcnR4cmVmCjMwMAolJUVPRgo=';
const encodedImage = fs
	.readFileSync(path.resolve(__dirname, '../../test-data/image.txt'), 'utf8')
	.trim();
const IMAGE_DOCUMENT = `data:image/png;base64,${encodedImage.slice(encodedImage.indexOf('base64,') + 7)}`;

const COUNTRIES = [
	{ id: COUNTRY_ID.NIGERIA, name: 'Nigeria' },
	{ id: COUNTRY_ID.USA, name: 'United States' },
	{ id: COUNTRY_ID.CANADA, name: 'Canada' },
	{ id: COUNTRY_ID.UK, name: 'United Kingdom' },
	{ id: COUNTRY_ID.FRANCE, name: 'France' },
	{ id: COUNTRY_ID.ITALY, name: 'Italy' }
];

const CASES = Object.values(KYC_DOCUMENT_TYPE).map((documentType, index) => ({
	documentType,
	country: COUNTRIES[index % COUNTRIES.length]
}));

describeOrSkip('Upload Source of Funds Document', function () {
	test.each(CASES)(
		'should upload a $documentType document for a customer residing in $country.name',
		async function ({ documentType, country }) {
			const customer = await createVerifiedCustomer(baseUrl, {
				residence_country_id: country.id,
				telephone: PhoneNumberGenerator.generatePhoneNumber(country.name)
			}, { kycLevel: 'level-one' });

			const response = await request(baseUrl)
				.post(KYC.LEVEL_TWO_DOCUMENT_UPLOAD)
				.set('Authorization', `Bearer ${customer.token}`)
				.set('SS-Device-Token', customer.deviceToken)
				.set('userAgent', 'api-test')
				.send({
					document_type: documentType,
					documents: [SOURCE_OF_FUNDS_DOCUMENT]
				});

			expect(response.status).toBe(STATUS.OK);
		});

		test('should upload an array of image files', async function () {
			const customer = await createVerifiedCustomer(baseUrl, {
				residence_country_id: COUNTRY_ID.USA,
				telephone: PhoneNumberGenerator.generatePhoneNumber('United States')
			}, { kycLevel: 'level-one' });

			console.log('[array of image files] customer:', JSON.stringify({
				user: customer.user,
				email: customer.payload.email,
				telephone: customer.payload.telephone,
				token: customer.token,
				deviceToken: customer.deviceToken
			}, null, 2));

			const response = await request(baseUrl)
				.post(KYC.LEVEL_TWO_DOCUMENT_UPLOAD)
				.set('Authorization', `Bearer ${customer.token}`)
				.set('SS-Device-Token', customer.deviceToken)
				.set('userAgent', 'api-test')
				.send({
					document_type: KYC_DOCUMENT_TYPE.NATIONAL_ID,
					documents: [IMAGE_DOCUMENT, IMAGE_DOCUMENT]
				});

			expect(response.status).toBe(STATUS.OK);
		});

		test('should upload a single image file', async function () {
			const customer = await createVerifiedCustomer(baseUrl, {
				residence_country_id: COUNTRY_ID.NIGERIA,
				telephone: PhoneNumberGenerator.generatePhoneNumber('Nigeria')
			}, { kycLevel: 'level-one' });

			console.log('[single image file] customer:', JSON.stringify({
				user: customer.user,
				email: customer.payload.email,
				telephone: customer.payload.telephone,
				token: customer.token,
				deviceToken: customer.deviceToken
			}, null, 2));

			const response = await request(baseUrl)
				.post(KYC.LEVEL_TWO_DOCUMENT_UPLOAD)
				.set('Authorization', `Bearer ${customer.token}`)
				.set('SS-Device-Token', customer.deviceToken)
				.set('userAgent', 'api-test')
				.send({
					document_type: KYC_DOCUMENT_TYPE.NATIONAL_ID,
					documents: [IMAGE_DOCUMENT]
				});

			expect(response.status).toBe(STATUS.OK);
		});
});
