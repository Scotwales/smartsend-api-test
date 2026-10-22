const apiClient = require('../../utilities/apiClient');
const { META, STATUS } = require('../../test-data/constants');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Towns Metadata', function() {

  test('should fetch towns with an optional state code', async function() {
    const response = await apiClient.get(META.TOWNS, {
      query: {
        state_code: process.env.ROUTELINK_STATE_CODE
      }
    });

    expect(response.status).toBe(STATUS.OK);
  });

});
