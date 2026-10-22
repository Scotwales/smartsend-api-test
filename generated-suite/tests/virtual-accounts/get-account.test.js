const apiClient = require('../../utilities/apiClient');
const { STATUS, VIRTUAL_ACCOUNT } = require('../../test-data/constants');
const { requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Get Virtual Account', function() {

  describe('Happy Path', function() {

    test('should fetch a virtual account successfully', async function() {
      const response = await apiClient.get(
        VIRTUAL_ACCOUNT.GET(requiredValue('ROUTELINK_VIRTUAL_ACCOUNT_NUMBER'))
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
