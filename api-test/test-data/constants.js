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


const ENVIRONMENTS = {
  LOCAL: 'local',
  DEV: 'dev',
  STAGING: 'staging',
  PRODUCTION: 'production'
};

const PHONEVERIFICATION = {
  SEND_OTP : 'mobile/verification/phoneVerification',
  VERIFY_OTP : 'mobile/verification/phoneOtpValidation'
}

const EMAILVERIFICATION = {
  SEND_OTP : 'mobile/verification/emailVerification',
  VERIFY_OTP : 'mobile/verification/emailOtpValidation'
}

const COUNTRY = {
  FETCH_COUNTRIES : 'mobile/countries',
  GET_STATES: (countryId) => `mobile/countries/${countryId}/states`,
  GET_CITIES_BY_COUNTRY: (countryId) => `mobile/countries/${countryId}/cities`
}

const USER = {
  PROFILE: 'mobile/user',
  UPDATE_PROFILE: 'mobile/user/update',
  PASSWORD_RESET: 'mobile/user/password-reset',
  TRANSACTION_PIN_RESET: 'mobile/user/transaction-pin-reset',
  DELETE_ACCOUNT: 'mobile/user/delete'
}

const BUSINESS_ADMIN = {
  UPDATE_KYC: 'business/admin/users/kyc-level'
}

const KYC = {
  LEVEL_TWO_DOCUMENT_UPLOAD: 'mobile/kyc/kyc-level-2-document-upload'
};

const KYC_DOCUMENT_TYPE = {
  PAY_SLIP: 'PAY_SLIP',
  BANK_STATEMENT: 'BANK_STATEMENT',
  TAX_RETURN: 'TAX_RETURN',
  INVESTMENT_CERTIFICATES: 'INVESTMENT_CERTIFICATES',
  CONTRACT_NOTES: 'CONTRACT_NOTES',
  SIGNED_WILL: 'SIGNED_WILL',
  GIFT_DECLARATION: 'GIFT_DECLARATION',
  LOAN_AGREEMENT: 'LOAN_AGREEMENT',
  SIGNED_SALES_CONTRACT: 'SIGNED_SALES_CONTRACT',
  PROPERTY_OWNERSHIP_DOCUMENTS: 'PROPERTY_OWNERSHIP_DOCUMENTS',
  OTHERS: 'OTHERS',
  DRIVERS_LICENSE: 'DRIVERS_LICENSE',
  PASSPORT: 'PASSPORT',
  NATIONAL_ID: 'NATIONAL_ID'
};

const COUNTRY_ID = {
  USA : '01j9bxp7gfmg2jyvdh64esrmb8',
  CANADA : '01j9bxn704ex5hmchtk9dr3xw7',
  FRANCE: '01j9bxndeyrsh2pv4rd0xfn6f9',
  UK: '01j9bxp7ar7rsaqn5nhct0k3dw',
  ITALY: '01j9bxnk70g0jdgq4knazw12cn',
  NIGERIA: '01j9bxnw0ts6sbwydt7kxqx06b'
}

const REGISTER = {
  REGISTER : 'mobile/register'
};

const FORGOT_PASSWORD = {
  FORGOT : 'mobile/forgot-password'
};

const RESET_PASSWORD = {
  RESET : 'mobile/reset-password'
};

const LOGIN = {
  LOGIN : 'mobile/login',
  VERIFY_OTP : 'mobile/new-device-validation'
};

const NEW_DEVICE_VALIDATION = {
  VERIFY_OTP : 'mobile/new-device-validation'
};

const TEST_TAGS = {
  SMOKE: 'smoke',
  CRITICAL: 'critical',
  REGRESSION: 'regression',
  USER_MANAGEMENT: 'user-management',
  BUSINESS_CORE: 'business-core'
};

const OTP = {
  VIEW_OTP : 'get-otp'
};

const BLAAIZ_COLLECTION = (amount, ref) => `blaaiz-collection?amount=${amount}&ref=${ref}`;

const SWAP_DEAL = {
  SOURCE_CURRENCIES: 'mobile/source-currencies',
  DESTINATION_CURRENCIES: (sourceCurrency) => `mobile/destination-currencies/${sourceCurrency}`,
  INITIATE: 'mobile/initiate-swap-deal',
  PROCEED: 'mobile/proceed-swap-deal',
  ADD_BENEFICIARY: 'mobile/add-beneficiary-details',
  BANK_LIST: 'mobile/bank-list',
  ACCOUNT_NAME_ENQUIRY: 'mobile/account-name-enquiry',
  FETCH_PAYING_DETAILS: (swapDeal) => `mobile/fetch-paying-details/${swapDeal}`,
  I_HAVE_MADE_THIS_PAYMENT: (swapDeal) => `mobile/i-have-made-this-payment/${swapDeal}`,
  TRANSACTION_STATUS: (swapDeal) => `mobile/transaction-status/${swapDeal}`,
  TRANSACTION_LIMIT: 'mobile/transaction-limit'
};

const TRANSACTION_PIN = {
  CREATE: 'mobile/transaction-pin',
  UPDATE: 'mobile/transaction-pin',
  VERIFY: 'mobile/transaction-pin/verify',
  TRIES_LEFT: 'mobile/transaction-pin/tries-left',
  VERIFY_PASSWORD: 'mobile/transaction-pin/verify-password',
  RESET: 'mobile/transaction-pin/reset'
};

module.exports = {
  STATUS,
  ENVIRONMENTS,
  PHONEVERIFICATION,
  COUNTRY_ID,
  EMAILVERIFICATION,
  COUNTRY,
  TEST_TAGS,
  OTP,
  REGISTER,
  FORGOT_PASSWORD,
  RESET_PASSWORD,
  LOGIN,
  NEW_DEVICE_VALIDATION,
  USER,
  SWAP_DEAL,
  BUSINESS_ADMIN,
  KYC,
  KYC_DOCUMENT_TYPE,
  TRANSACTION_PIN,
  BLAAIZ_COLLECTION,
};
