
import mongoose from "mongoose";
import User from "../models/User.js";

const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const sanitizeRegexInput = (value = "") =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const PUBLIC_USER_FIELDS =
  "name email avatar country state city bio isOnline lastSeen createdAt updatedAt";

export const getMyProfile = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await User.findById(req.userId).select(PUBLIC_USER_FIELDS);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get my profile error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
    });
  }
};

export const getUserProfileById = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId",
      });
    }

    const user = await User.findById(userId).select(PUBLIC_USER_FIELDS);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get user profile by id error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const query = String(req.query.q || "").trim();
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 20), 100);
    const skip = (page - 1) * limit;

    const filter = {};
    if (query) {
      const safeQuery = sanitizeRegexInput(query);
      filter.$or = [
        { name: { $regex: safeQuery, $options: "i" } },
        { email: { $regex: safeQuery, $options: "i" } },
        { country: { $regex: safeQuery, $options: "i" } },
        { state: { $regex: safeQuery, $options: "i" } },
        { city: { $regex: safeQuery, $options: "i" } },
      ];
    }

    if (req.userId && mongoose.Types.ObjectId.isValid(req.userId)) {
      filter._id = { $ne: new mongoose.Types.ObjectId(req.userId) };
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select(PUBLIC_USER_FIELDS)
        .sort({ isOnline: -1, lastSeen: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      query,
      count: users.length,
      total,
      page,
      limit,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while searching users",
    });
  }
};

export const updateMyPresence = async (req, res) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { isOnline } = req.body;
    if (typeof isOnline !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isOnline must be a boolean",
      });
    }

    const update = {
      isOnline,
      lastSeen: isOnline ? null : new Date(),
    };

    const user = await User.findByIdAndUpdate(req.userId, update, {
      new: true,
      runValidators: true,
    }).select(PUBLIC_USER_FIELDS);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Presence updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update presence error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while updating presence",
    });
  }
};

export const getOnlineUsers = async (req, res) => {
  try {
    const limit = Math.min(parsePositiveInt(req.query.limit, 50), 200);

    const users = await User.find({ isOnline: true })
      .select(PUBLIC_USER_FIELDS)
      .sort({ updatedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get online users error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching online users",
    });
  }
};
