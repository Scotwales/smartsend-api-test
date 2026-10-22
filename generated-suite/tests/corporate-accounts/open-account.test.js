const apiClient = require('../../utilities/apiClient');
const { CORPORATE_ACCOUNT, STATUS } = require('../../test-data/constants');
const { requestPayload } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Open Corporate Account', function() {

  describe('Happy Path', function() {

    mutationTest('should open a corporate account successfully', async function() {
      const response = await apiClient.post(
        CORPORATE_ACCOUNT.OPEN,
        requestPayload('ROUTELINK_CORPORATE_ACCOUNT_PAYLOAD_JSON', 'ObnOpenCorporateAccountRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
