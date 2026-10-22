const apiClient = require('../../utilities/apiClient');
const { STATUS, TRANSACTION } = require('../../test-data/constants');
const { requestPayload } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;
const runMutation = process.env.RUN_MUTATION_TESTS === 'true';
const mutationTest = runMutation ? test : test.skip;

describeOrSkip('Transaction Transfer', function() {

  describe('Happy Path', function() {

    mutationTest('should submit a transfer successfully', async function() {
      const response = await apiClient.post(
        TRANSACTION.TRANSFER,
        requestPayload('ROUTELINK_TRANSFER_PAYLOAD_JSON', 'ObnTransferRequest')
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
