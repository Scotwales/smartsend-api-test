const apiClient = require('../../utilities/apiClient');
const { STATUS, VIRTUAL_ACCOUNT } = require('../../test-data/constants');
const { requestPayload } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Create Virtual Account', function() {

  describe('Happy Path', function() {

    mutationTest('should create a virtual account successfully', async function() {
      const response = await apiClient.post(
        VIRTUAL_ACCOUNT.CREATE,
        requestPayload('ROUTELINK_VIRTUAL_ACCOUNT_PAYLOAD_JSON', 'ObnCreateVirtualAccountRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
