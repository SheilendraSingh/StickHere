
import mongoose from "mongoose";

export class ValidationError extends Error {
  constructor(message, statusCode = 400, field = "") {
    super(message);
    this.name = "ValidationError";
    this.statusCode = statusCode;
    this.field = field;
  }
}

export const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

export const normalizeString = (value = "") => String(value).trim();

export const normalizeEmail = (value = "") =>
  normalizeString(value).toLowerCase();

export const validateEmail = (value = "") =>
  /^\S+@\S+\.\S+$/.test(normalizeEmail(value));

export const validatePassword = (value = "", minLength = 8) =>
  typeof value === "string" && value.length >= minLength;

export const sanitizeRegexInput = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const isValidObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

export const parsePositiveInt = (value, fallback = 1) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const validatePagination = ({
  page,
  limit,
  fallbackPage = 1,
  fallbackLimit = 20,
  maxLimit = 100,
} = {}) => {
  const normalizedPage = parsePositiveInt(page, fallbackPage);
  const normalizedLimit = Math.min(
    parsePositiveInt(limit, fallbackLimit),
    maxLimit,
  );

  return {
    page: normalizedPage,
    limit: normalizedLimit,
    skip: (normalizedPage - 1) * normalizedLimit,
  };
};

export const assertRequiredFields = (payload = {}, requiredFields = []) => {
  const missing = requiredFields.filter((field) => {
    const value = payload[field];
    if (typeof value === "boolean" || typeof value === "number") return false;
    return !isNonEmptyString(value);
  });

  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required field(s): ${missing.join(", ")}`,
      400,
      missing[0],
    );
  }
};

export const assertValidObjectId = (value, field = "id") => {
  if (!isValidObjectId(value)) {
    throw new ValidationError(`Invalid ${field}`, 400, field);
  }
};

export default {
  ValidationError,
  isNonEmptyString,
  normalizeString,
  normalizeEmail,
  validateEmail,
  validatePassword,
  sanitizeRegexInput,
  isValidObjectId,
  parsePositiveInt,
  validatePagination,
  assertRequiredFields,
  assertValidObjectId,
};
