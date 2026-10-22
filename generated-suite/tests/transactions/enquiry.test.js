const apiClient = require('../../utilities/apiClient');
const { STATUS, TRANSACTION } = require('../../test-data/constants');
const { requestPayload } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Transaction Name Enquiry', function() {

  describe('Happy Path', function() {

    test('should submit a name enquiry successfully', async function() {
      const response = await apiClient.post(
        TRANSACTION.ENQUIRY,
        requestPayload('ROUTELINK_NAME_ENQUIRY_PAYLOAD_JSON', 'ObnNameEnquiryRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
