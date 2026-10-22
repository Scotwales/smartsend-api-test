const apiClient = require('../../utilities/apiClient');
const { ACCOUNT, STATUS } = require('../../test-data/constants');
const { requestPayload, requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Create Account Sub-Merchant', function() {

  describe('Happy Path', function() {

    mutationTest('should create a sub-merchant successfully', async function() {
      const response = await apiClient.post(
        ACCOUNT.SUB_MERCHANTS(requiredValue('ROUTELINK_CORPORATE_ACCOUNT_NUMBER')),
        requestPayload('ROUTELINK_SUB_MERCHANT_PAYLOAD_JSON', 'ObnOpenCorporateAccountRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
