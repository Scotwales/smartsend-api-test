const apiClient = require('../../utilities/apiClient');
const { META, STATUS } = require('../../test-data/constants');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Banks Metadata', function() {

  test('should fetch banks successfully', async function() {
    const response = await apiClient.get(META.BANKS);

    expect(response.status).toBe(STATUS.OK);
  });

});
