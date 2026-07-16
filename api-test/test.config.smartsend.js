// test.config.compliance.js - Smartsend API test suite configuration
const testSuites = {

  'users': {
    name: 'User Management',
    runner: 'tests/users/run-tests-in-order.test.js',
    description: 'User profile operations - get, update profile, update password, update KYC level',
    tags: ['profile', 'password', 'kyc', 'users'],
  },

  'transaction-pin': {
    name: 'Transaction PIN Management',
    runner: 'tests/transaction-pin/run-tests-in-order.test.js',
    description: 'Transaction PIN lifecycle - create, verify, update, reset, tries-left',
    tags: ['pin', 'security', 'transaction'],
  },


  'swap-deal': {
    name: 'Swap Deal',
    runner: 'tests/swap-deal/run-tests-in-order.test.js',
    description: 'Swap deal flow - initiate, proceed, beneficiaries, currencies, banks, status',
    tags: ['swap', 'deal', 'currencies', 'beneficiaries', 'payment'],
  },

  'reset-password': {
    name: 'Password Reset',
    runner: 'tests/reset-password/run-tests-in-order.test.js',
    description: 'Password reset flow - forgot, reset, verify OTP',
    tags: ['password', 'reset', 'auth'],
  },

  'register': {
    name: 'User Registration',
    runner: 'tests/register/run-tests-in-order.test.js',
    description: 'New user registration flow',
    tags: ['register', 'auth', 'onboarding'],
  },

  'login': {
    name: 'Login',
    runner: 'tests/login/run-tests-in-order.test.js',
    description: 'Login flow - customer login, verify OTP for new device',
    tags: ['login', 'auth', 'otp'],
  },

  'phone-verification': {
    name: 'Phone Verification',
    runner: 'tests/phone-verification/run-tests-in-order.test.js',
    description: 'Phone OTP verification - send and verify OTP',
    tags: ['phone', 'otp', 'verification'],
  },

  'email-verification': {
    name: 'Email Verification',
    runner: 'tests/email-verification/run-tests-in-order.test.js',
    description: 'Email OTP verification - send and verify OTP',
    tags: ['email', 'otp', 'verification'],
  },

  'country': {
    name: 'Country Data',
    runner: 'tests/country/run-tests-in-order.test.js',
    description: 'Country lookup - residence country, states, cities',
    tags: ['country', 'location', 'reference-data'],
  },

  'send-money': {
    name: 'Send Money',
    runner: 'tests/send-money/run-tests-in-order.test.js',
    description: 'Cross-currency send money flow - CAD to NGN business logic',
    tags: ['send', 'money', 'swap', 'cad', 'ngn'],
  },
};

const testGroups = {
  'all': {
    description: 'All Smartsend API test modules',
    suites: Object.keys(testSuites),
  },

  'smoke': {
    description: 'Quick smoke tests - login, register, country',
    suites: ['login', 'register', 'country'],
  },

  'regression': {
    description: 'Full regression test suite',
    suites: Object.keys(testSuites),
  },

  'critical': {
    description: 'Critical path tests - core user flows',
    suites: ['login', 'register', 'swap-deal', 'users'],
  },

  'auth': {
    description: 'Authentication-related tests',
    suites: ['login', 'register', 'reset-password'],
  },

  'onboarding': {
    description: 'User onboarding flow tests',
    suites: ['register', 'phone-verification', 'email-verification'],
  },

  'transaction': {
    description: 'Transaction-related tests',
    suites: ['transaction-pin', 'swap-deal', 'send-money'],
  },
};

module.exports = {
  testSuites,
  testGroups,
};
