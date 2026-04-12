
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export class AuthServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "AuthServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const PUBLIC_USER_FIELDS =
  "name email avatar country state city bio isOnline lastSeen createdAt updatedAt";

export const normalizeEmail = (value = "") =>
  String(value).trim().toLowerCase();

const ensureUserId = (userId) => {
  if (!userId) {
    throw new AuthServiceError("Unauthorized", 401);
  }
};

export const registerUserService = async (payload = {}) => {
  const { name, email, password, country, state, city, bio, avatar } = payload;

  if (!name || !email || !password) {
    throw new AuthServiceError("Name, email, and password are required", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    throw new AuthServiceError("User already exists", 409);
  }

  const user = await User.create({
    name: String(name).trim(),
    email: normalizedEmail,
    password,
    country,
    state,
    city,
    bio,
    avatar,
  });

  const token = generateToken(user._id.toString());
  return { token, user };
};

export const loginUserService = async ({ email, password } = {}) => {
  if (!email || !password) {
    throw new AuthServiceError("Email and password are required", 400);
  }

  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new AuthServiceError("Invalid email or password", 401);
  }

  const token = generateToken(user._id.toString());
  return { token, user };
};

export const getUserProfileService = async (userId) => {
  ensureUserId(userId);

  const user = await User.findById(userId).select("-password");
  if (!user) {
    throw new AuthServiceError("User not found", 404);
  }

  return user;
};

export const updateUserProfileService = async (userId, updates = {}) => {
  ensureUserId(userId);

  const user = await User.findById(userId);
  if (!user) {
    throw new AuthServiceError("User not found", 404);
  }

  const { name, email, password, country, state, city, bio, avatar } = updates;

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  if (typeof email === "string" && email.trim()) {
    const normalizedEmail = normalizeEmail(email);
    if (normalizedEmail !== user.email) {
      const emailTaken = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: userId },
      });
      if (emailTaken) {
        throw new AuthServiceError("Email already in use", 409);
      }
      user.email = normalizedEmail;
    }
  }

  if (password) user.password = password;
  if (typeof country === "string") user.country = country.trim();
  if (typeof state === "string") user.state = state.trim();
  if (typeof city === "string") user.city = city.trim();
  if (typeof bio === "string") user.bio = bio;
  if (typeof avatar === "string") user.avatar = avatar.trim();

  await user.save();
  return user;
};

export const logoutUserService = async () => ({
  success: true,
  message: "User logged out successfully",
});
