export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export const isValidEmail = (email: string) =>
  /^\S+@\S+\.\S+$/.test(String(email).trim().toLowerCase());

export const isStrongPassword = (password: string, minLength = 8) =>
  typeof password === "string" && password.length >= minLength;

export const validateLoginForm = (payload: {
  email: string;
  password: string;
}) => {
  if (!isValidEmail(payload.email)) return "Please enter a valid email";
  if (!isStrongPassword(payload.password, 6))
    return "Password must be at least 6 characters";
  return "";
};

export const validateSignupForm = (payload: {
  name: string;
  email: string;
  password: string;
}) => {
  if (!isNonEmptyString(payload.name)) return "Name is required";
  if (!isValidEmail(payload.email)) return "Please enter a valid email";
  if (!isStrongPassword(payload.password, 8))
    return "Password must be at least 8 characters";
  return "";
};

const validators = {
  isNonEmptyString,
  isValidEmail,
  isStrongPassword,
  validateLoginForm,
  validateSignupForm,
};

export default validators;
