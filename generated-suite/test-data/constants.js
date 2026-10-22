const STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

const PING = {
  HEALTH: '/v1/ping'
};

const META = {
  PRODUCTS: '/v1/meta/products',
  BANKS: '/v1/meta/banks',
  NATIONALITIES: '/v1/meta/nationalities',
  STATES: '/v1/meta/states',
  TOWNS: '/v1/meta/towns',
  SECTORS: '/v1/meta/sectors',
  BUSINESS_TYPES: '/v1/meta/business-types',
  ISO_CODES: '/v1/meta/iso-codes',
  CHANNELS: '/v1/meta/channels'
};

const ACCOUNT = {
  OPEN: '/v1/accounts',
  GET: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}`,
  SUB_MERCHANTS: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/sub-merchants`,
  BALANCES: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/balances`,
  TIER_UPGRADE: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/tier-upgrade`,
  MANDATE: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/mandate`,
  MANDATE_RESEND: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/mandate/resend`,
  MANDATE_CONFIRM: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/mandate/confirm`,
  DEBITS: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/debits`,
  CREDITS: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/credits`,
  CREDIT_RATING: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/credit-rating`,
  CREDIT_RATING_SCALE: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/credit-rating-scale`,
  TIER_STATUS: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/tier-status`,
  TRANSACTIONS: accountNumber => `/v1/accounts/${encodeURIComponent(accountNumber)}/transactions`
};

const CORPORATE_ACCOUNT = {
  OPEN: '/v1/corporate-accounts'
};

const TRANSACTION = {
  ENQUIRY: '/v1/transactions/enquiry',
  TRANSFER: '/v1/transactions',
  GET: transactionReference => `/v1/transactions/${encodeURIComponent(transactionReference)}`
};

const VIRTUAL_ACCOUNT = {
  CREATE: '/v1/virtual-accounts',
  GET: accountNumber => `/v1/virtual-accounts/${encodeURIComponent(accountNumber)}`
};

module.exports = {
  STATUS,
  PING,
  META,
  ACCOUNT,
  CORPORATE_ACCOUNT,
  TRANSACTION,
  VIRTUAL_ACCOUNT
};
