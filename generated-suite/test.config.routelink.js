const testSuites = {
  ping: {
    name: 'Ping',
    runner: 'tests/ping/run-tests-in-order.test.js',
    description: 'Ping health check',
    tags: ['ping', 'health']
  },

  meta: {
    name: 'Meta Data',
    runner: 'tests/meta/run-tests-in-order.test.js',
    description: 'Products, banks, nationalities, states, towns, sectors, business types, ISO codes, and channels',
    tags: ['meta', 'reference-data']
  },

  accounts: {
    name: 'Accounts',
    runner: 'tests/accounts/run-tests-in-order.test.js',
    description: 'Personal account details, balances, mandates, postings, credit ratings, tier status, and transactions',
    tags: ['accounts', 'mandates', 'transactions']
  },

  'corporate-accounts': {
    name: 'Corporate Accounts',
    runner: 'tests/corporate-accounts/run-tests-in-order.test.js',
    description: 'Corporate account opening',
    tags: ['corporate', 'accounts']
  },

  transactions: {
    name: 'Transactions',
    runner: 'tests/transactions/run-tests-in-order.test.js',
    description: 'Name enquiry, transfer, and transaction status',
    tags: ['transactions', 'transfer']
  },

  'virtual-accounts': {
    name: 'Virtual Accounts',
    runner: 'tests/virtual-accounts/run-tests-in-order.test.js',
    description: 'Virtual account creation and retrieval',
    tags: ['virtual-accounts']
  }
};

const testGroups = {
  all: {
    description: 'All Routelink API test modules',
    suites: Object.keys(testSuites)
  },

  smoke: {
    description: 'Ping and metadata tests',
    suites: ['ping', 'meta']
  },

  regression: {
    description: 'Full Routelink API test suite',
    suites: Object.keys(testSuites)
  },

  transaction: {
    description: 'Account and transfer transaction tests',
    suites: ['accounts', 'transactions']
  }
};

module.exports = {
  testSuites,
  testGroups
};
