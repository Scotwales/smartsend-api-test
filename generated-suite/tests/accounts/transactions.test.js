const apiClient = require('../../utilities/apiClient');
const { ACCOUNT, STATUS } = require('../../test-data/constants');
const { optionalValue, requiredValue } = require('../../utilities/fixtures');

let baseUrl = process.env.BASE_URL;
if (baseUrl && !baseUrl.endsWith('/')) baseUrl += '/';
const runIntegration = !!process.env.BASE_URL;
const describeOrSkip = runIntegration ? describe : describe.skip;

function getTransactionQuery() {
  const query = {};
  const from = optionalValue('ROUTELINK_TRANSACTION_FROM');
  const to = optionalValue('ROUTELINK_TRANSACTION_TO');
  const page = optionalValue('ROUTELINK_TRANSACTION_PAGE');
  const limit = optionalValue('ROUTELINK_TRANSACTION_LIMIT');

  if (from) query.from = from;
  if (to) query.to = to;
  if (page) {
    query.page = Number(page);
    if (!Number.isInteger(query.page)) {
      throw new Error('ROUTELINK_TRANSACTION_PAGE must be an integer.');
    }
  }
  if (limit) {
    query.limit = Number(limit);
    if (!Number.isInteger(query.limit)) {
      throw new Error('ROUTELINK_TRANSACTION_LIMIT must be an integer.');
    }
  }

  return query;
}

describeOrSkip('Get Account Transactions', function() {

  describe('Happy Path', function() {

    test('should fetch account transactions successfully', async function() {
      const response = await apiClient.get(
        ACCOUNT.TRANSACTIONS(requiredValue('ROUTELINK_ACCOUNT_NUMBER')),
        { query: getTransactionQuery() }
      );

      expect(response.status).toBe(STATUS.OK);
    });

  });

});
