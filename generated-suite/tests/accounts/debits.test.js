const apiClient = require('../../utilities/apiClient');
const { ACCOUNT, STATUS } = require('../../test-data/constants');
const { requestPayload, requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Post Account Debit', function() {

  describe('Happy Path', function() {

    mutationTest('should post an account debit successfully', async function() {
      const response = await apiClient.post(
        ACCOUNT.DEBITS(requiredValue('ROUTELINK_ACCOUNT_NUMBER')),
        requestPayload('ROUTELINK_POSTING_PAYLOAD_JSON', 'ObnPostingRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
