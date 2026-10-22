const apiClient = require('../../utilities/apiClient');
const { STATUS, TRANSACTION } = require('../../test-data/constants');
const { requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Get Transaction', function() {

  describe('Happy Path', function() {

    test('should fetch a transaction successfully', async function() {
      const response = await apiClient.get(
        TRANSACTION.GET(requiredValue('ROUTELINK_TRANSACTION_REFERENCE'))
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
