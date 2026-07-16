require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',

  baseUrl: (process.env.BASE_URL || 'https://smartsend-dev-api.smartsend.uk/v1').replace(/\/+$/, ''),

  authToken: process.env.AUTH_TOKEN || null,

  testPhone: process.env.TEST_PHONE || null,

  testCode: process.env.TEST_OTP_CODE || null,

  timeout: parseInt(process.env.TEST_TIMEOUT, 10) || 30000,

  retry: {
    count: parseInt(process.env.RETRY_COUNT, 10) || 2,
    delayMs: parseInt(process.env.RETRY_DELAY_MS, 10) || 1000,
    enabled: (process.env.RETRY_ENABLED || 'true') === 'true'
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    logRequestBody: (process.env.LOG_REQUEST_BODY || 'false') === 'true',
    logResponseBody: (process.env.LOG_RESPONSE_BODY || 'false') === 'true'
  },

  isCi: process.env.CI === 'true',

  endpoints: {
    mobile: {
      phoneVerification: '/mobile/verification/phoneVerification',
      phoneOtpValidation: '/mobile/verification/phoneOtpValidation'
    },
    business: {
      phoneVerification: '/business/verification/phoneVerification',
      phoneOtpValidation: '/business/verification/phoneOtpValidation'
    }
  },

  getEndpoint(domain, action) {
    return this.endpoints[domain]?.[action];
  }
};

module.exports = config;
