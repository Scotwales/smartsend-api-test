const { REQUEST_SCHEMAS } = require('../test-data/request-schemas');

function requiredValue(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Required test fixture ${name} is not configured.`);
  }
  return value;
}

function optionalValue(name) {
  const value = process.env[name];
  return value === undefined || value === '' ? undefined : value;
}

function validateValue(name, value, expectedType) {
  const valid = expectedType === 'array'
    ? Array.isArray(value)
    : expectedType === 'integer'
      ? Number.isInteger(value)
      : expectedType === 'number'
        ? typeof value === 'number' && Number.isFinite(value)
        : typeof value === expectedType;

  if (!valid) {
    throw new Error(`Test fixture ${name} contains a value with an invalid JSON type.`);
  }
}

function validateVirtualAccountSharing(value, name) {
  if (!Array.isArray(value)) {
    throw new Error(`Test fixture ${name}.sharing must be an array.`);
  }

  value.forEach((entry, index) => {
    const entryName = `${name}.sharing[${index}]`;
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      throw new Error(`Test fixture ${entryName} must be an object.`);
    }
    const allowedKeys = ['account_number', 'percent'];
    const unknownKey = Object.keys(entry).find(key => !allowedKeys.includes(key));
    if (unknownKey) {
      throw new Error(`Test fixture ${entryName} contains a property not defined by the API schema.`);
    }
    if (Object.hasOwn(entry, 'account_number')) {
      validateValue(`${entryName}.account_number`, entry.account_number, 'string');
    }
    if (Object.hasOwn(entry, 'percent')) {
      validateValue(`${entryName}.percent`, entry.percent, 'number');
    }
  });
}

function requestPayload(environmentName, schemaName) {
  const raw = requiredValue(environmentName);
  let payload;

  try {
    payload = JSON.parse(raw);
  } catch {
    throw new Error(`Test fixture ${environmentName} must contain valid JSON.`);
  }

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    throw new Error(`Test fixture ${environmentName} must be a JSON object.`);
  }

  const schema = REQUEST_SCHEMAS[schemaName];
  if (!schema) {
    throw new Error(`No request schema is registered for ${schemaName}.`);
  }

  const unknownKey = Object.keys(payload).find(key => !Object.hasOwn(schema, key));
  if (unknownKey) {
    throw new Error(`Test fixture ${environmentName} contains a property not defined by ${schemaName}.`);
  }

  Object.entries(payload).forEach(([key, value]) => {
    validateValue(`${environmentName}.${key}`, value, schema[key]);
  });

  if (schemaName === 'ObnCreateVirtualAccountRequest' && Object.hasOwn(payload, 'sharing')) {
    validateVirtualAccountSharing(payload.sharing, environmentName);
  }

  return payload;
}

module.exports = {
  optionalValue,
  requestPayload,
  requiredValue
};
