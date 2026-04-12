import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import {
  assertEmailConfigured,
  sendTestEmailService,
} from "../services/emailServices.js";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, country, state, city, bio, avatar } =
      req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "User already exists" });
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

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user,
    });
  } catch (error) {
    console.error("Register error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during registration" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail }).select(
      "+password",
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user, // toJSON removes password
    });
  } catch (error) {
    console.error("Login error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during login" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("Get user profile error", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { name, email, password, country, state, city, bio, avatar } =
      req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (typeof name === "string" && name.trim()) user.name = name.trim();

    if (typeof email === "string" && email.trim()) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== user.email) {
        const emailTaken = await User.findOne({
          email: normalizedEmail,
          _id: { $ne: userId },
        });
        if (emailTaken) {
          return res.status(409).json({
            success: false,
            message: "Email already in use",
          });
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
    return res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update user profile error", error.message);
    res.status(500).json({
      success: false,
      message: "Server error while updating user profile",
    });
  }
};

export const logoutUser = async (_req, res) => {
  try {
    return res
      .status(200)
      .json({ success: true, message: "User logged out successfully" });
  } catch (error) {
    console.error("Logout error", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};

export const sendTestEmail = async (req, res) => {
  try {
    assertEmailConfigured();

    const explicitTo =
      typeof req.body?.to === "string" ? req.body.to.trim().toLowerCase() : "";
    const fallbackTo =
      typeof req.user?.email === "string"
        ? req.user.email.trim().toLowerCase()
        : "";
    const to = explicitTo || fallbackTo;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email is required (body.to or logged-in user email)",
      });
    }

    const result = await sendTestEmailService({
      to,
      requestedBy: req.user?.name || req.user?.email || "StickHere User",
    });

    return res.status(200).json({
      success: true,
      message: "SMTP test email sent successfully",
      result,
    });
  } catch (error) {
    console.error("Send test email error", error.message);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error while sending test email",
    });
  }
};
