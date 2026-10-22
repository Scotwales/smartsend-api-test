const apiClient = require('../../utilities/apiClient');
const { PING, STATUS } = require('../../test-data/constants');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

describeOrSkip('Ping', function() {

  test('should return 200 for health check', async function() {
    const response = await apiClient.get(PING.HEALTH);

    expect(response.status).toBe(STATUS.OK);
  });

});
