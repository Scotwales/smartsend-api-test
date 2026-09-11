const request = require('supertest');
const { STATUS, SWAP_DEAL } = require('../test-data/constants');

/**
 * Creates a fully initiated + proceeded swap deal and returns its ID
 * @param {string} baseUrl - API base URL
 * @param {Object} customer - Customer object with token and deviceToken
 * @param {number} [amount=200000] - Amount to send
 * @returns {Promise<string|null>} Swap deal ID or null on failure
 */
async function createSwapDeal(baseUrl, customer, amount = 200000) {
  const src = await request(baseUrl)
    .get(SWAP_DEAL.SOURCE_CURRENCIES)
    .set('Authorization', `Bearer ${customer.token}`)
    .set('SS-Device-Token', customer.deviceToken)
    .set('userAgent', 'api-test');

  if (src.status !== STATUS.OK || !src.body.data?.length) return null;
  const sourceId = src.body.data[0].id;

  const dest = await request(baseUrl)
    .get(SWAP_DEAL.DESTINATION_CURRENCIES(sourceId))
    .set('Authorization', `Bearer ${customer.token}`)
    .set('SS-Device-Token', customer.deviceToken)
    .set('userAgent', 'api-test');

  if (dest.status !== STATUS.OK || !dest.body.data?.length) return null;
  const destId = dest.body.data[0].id;

  const init = await request(baseUrl)
    .post(SWAP_DEAL.INITIATE)
    .set('Authorization', `Bearer ${customer.token}`)
    .set('SS-Device-Token', customer.deviceToken)
    .set('userAgent', 'api-test')
    .send({ source_currency: sourceId, destination_currency: destId, amount });

  if (init.status !== STATUS.OK) return null;

  const rate = parseFloat(init.body.data.exchange_rate);
  const useDivision = init.body.data.exchange_rate_currency && !init.body.data.exchange_rate_currency.startsWith('1 ');
  const totalAmount = useDivision
    ? Math.floor((amount / rate) * 100) / 100
    : Math.floor(amount * rate);

  const proceed = await request(baseUrl)
    .post(SWAP_DEAL.PROCEED)
    .set('Authorization', `Bearer ${customer.token}`)
    .set('SS-Device-Token', customer.deviceToken)
    .set('userAgent', 'api-test')
    .send({
      source_currency: sourceId,
      destination_currency: destId,
      amount,
      total_amount: totalAmount
    });

  if (proceed.status !== STATUS.OK) return null;

  return proceed.body.data?.id || null;
}

module.exports = { createSwapDeal };
