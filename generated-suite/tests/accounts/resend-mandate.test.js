const apiClient = require('../../utilities/apiClient');
const { ACCOUNT, STATUS } = require('../../test-data/constants');
const { requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Resend Account Mandate', function() {

  describe('Happy Path', function() {

    mutationTest('should resend an account mandate successfully', async function() {
      const response = await apiClient.post(
        ACCOUNT.MANDATE_RESEND(requiredValue('ROUTELINK_ACCOUNT_NUMBER'))
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
