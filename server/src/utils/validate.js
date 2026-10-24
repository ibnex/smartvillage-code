const mongoose = require('mongoose');
const ApiError = require('./ApiError');

const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(String(value || ''));

const assertObjectId = (value, label = 'id') => {
  if (!isValidObjectId(value)) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return value;
};

const parseNumber = (value, field, { min = -Infinity, max = Infinity, required = false } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw new ApiError(400, `${field} is required`);
    return undefined;
  }
  const num = Number(value);
  if (!Number.isFinite(num)) throw new ApiError(400, `${field} must be a number`);
  if (num < min || num > max) {
    throw new ApiError(400, `${field} must be between ${min} and ${max}`);
  }
  return num;
};

const pickDefined = (source, keys) => {
  const out = {};
  keys.forEach((key) => {
    if (source[key] !== undefined) out[key] = source[key];
  });
  return out;
};

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = {
  isValidObjectId,
  assertObjectId,
  parseNumber,
  pickDefined,
  escapeRegex,
};
