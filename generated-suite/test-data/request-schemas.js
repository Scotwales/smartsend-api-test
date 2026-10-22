const REQUEST_SCHEMAS = {
  ObnOpenAccountRequest: {
    first_name: 'string',
    last_name: 'string',
    middle_name: 'string',
    date_of_birth: 'string',
    gender: 'string',
    bvn: 'string',
    nin: 'string',
    phone_number: 'string',
    email: 'string',
    address: 'string',
    external_customer_reference: 'string'
  },
  ObnOpenCorporateAccountRequest: {
    company_name: 'string',
    rc_number: 'string',
    tin: 'string',
    registration_date: 'string',
    sector_code: 'string',
    state_code: 'string',
    product_code: 'string',
    business_type: 'integer',
    phone_number: 'string',
    email: 'string',
    contact_person: 'string',
    signatory_bvn: 'string',
    external_customer_reference: 'string'
  },
  ObnConfirmMandateRequest: {
    otp: 'string'
  },
  ObnPostingRequest: {
    amount: 'number',
    narration: 'string',
    transaction_reference: 'string',
    refund_of: 'string'
  },
  ObnNameEnquiryRequest: {
    destination_bank_code: 'string',
    destination_account_number: 'string',
    destination_account_name: 'string',
    source_account_number: 'string'
  },
  ObnTransferRequest: {
    source_account_number: 'string',
    destination_account_number: 'string',
    destination_bank_code: 'string',
    amount: 'number',
    narration: 'string',
    transaction_reference: 'string',
    name_enquiry_reference: 'string'
  },
  ObnCreateVirtualAccountRequest: {
    type: 'string',
    account_name: 'string',
    external_reference: 'string',
    phone_number: 'string',
    amount: 'number',
    expires_at: 'string',
    sharing: 'array'
  }
};

module.exports = { REQUEST_SCHEMAS };
