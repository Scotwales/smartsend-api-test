# Smartsend API Test Suite

Automated integration tests for the Smartsend Mobile App backend.

## Setup

```bash
cp .env.example .env
```

Edit `.env` and set `BASE_URL` to the target API endpoint (e.g. `https://smartsend-dev-api.smartsend.uk/v1`).

## Running Tests

### All tests

```bash
npm test
```

### By suite

```bash
npm test -- send-money
npm test -- users
npm test -- swap-deal
npm test -- login
npm test -- register
npm test -- country
npm test -- transaction-pin
npm test -- reset-password
npm test -- phone-verification
```

### By group

```bash
npm test -- smoke        # login, register, country
npm test -- critical     # login, register, swap-deal, users
npm test -- regression   # all suites
npm test -- auth         # login, register, reset-password
npm test -- transaction  # transaction-pin, swap-deal, send-money
```

### Single test file

```bash
npx jest tests/send-money/CAD-NGN.test.js
npx jest tests/send-money/NGN-CAD.test.js
```

## Test Reports

HTML reports are generated in the `reports/` directory after each run.

## Test Suites

| Suite | Description | Tags |
|---|---|---|
| `send-money` | Cross-currency flow (CAD-NGN, NGN-CAD) | send, money, swap, cad, ngn |
| `users` | Profile get/update, password, KYC | profile, password, kyc |
| `swap-deal` | Full swap initiate/proceed/beneficiary | swap, deal, currencies |
| `login` | Customer login, new-device OTP | login, auth, otp |
| `register` | New user registration | register, auth, onboarding |
| `country` | Residence country, states, cities | country, location |
| `transaction-pin` | PIN create/verify/update/reset | pin, security |
| `reset-password` | Forgot/reset password flow | password, reset |
| `phone-verification` | Phone OTP send/verify | phone, otp |
