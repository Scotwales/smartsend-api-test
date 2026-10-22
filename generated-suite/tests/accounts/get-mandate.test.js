const apiClient = require('../../utilities/apiClient');
const { ACCOUNT, STATUS } = require('../../test-data/constants');
const { requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Get Account Mandate', function() {

  describe('Happy Path', function() {

    test('should fetch an account mandate successfully', async function() {
      const response = await apiClient.get(
        ACCOUNT.MANDATE(requiredValue('ROUTELINK_ACCOUNT_NUMBER'))
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
