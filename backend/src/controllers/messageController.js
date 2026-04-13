import mongoose from "mongoose";
import Message from "../models/Message.js";
import Room from "../models/Room.js";

const normalizeRoomName = (value = "") => String(value).trim().toLowerCase();
const ALLOWED_MESSAGE_TYPES = new Set([
  "text",
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
  "mixed",
]);

const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const canAccessRoom = (room, userId) => {
  if (!room.isPrivate) return true;
  if (!userId) return false;
  return room.users?.some((id) => id.toString() === userId.toString());
};

export const sendMessage = async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { roomName, text, attachments = [], messageType = "text" } = req.body;

    if (!roomName) {
      return res.status(400).json({
        success: false,
        message: "roomName is required",
      });
    }

    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!hasText && !hasAttachments) {
      return res.status(400).json({
        success: false,
        message: "Message must contain text or attachments",
      });
    }

    const normalizedMessageType = String(messageType).trim().toLowerCase();
    if (!ALLOWED_MESSAGE_TYPES.has(normalizedMessageType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid messageType",
      });
    }

    const normalizedRoomName = normalizeRoomName(roomName);
    const room = await Room.findOne({ roomName: normalizedRoomName });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!canAccessRoom(room, req.user?._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to post in this room",
      });
    }

    const finalMessageType =
      hasAttachments && hasText && normalizedMessageType === "text"
        ? "mixed"
        : normalizedMessageType;

    const message = await Message.create({
      sender: req.user._id,
      room: room._id,
      text: hasText ? text.trim() : "",
      messageType: finalMessageType,
      attachments: hasAttachments ? attachments : [],
    });

    room.latestMessage = message._id;
    await room.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name email avatar country state city")
      .populate("room", "roomName displayName type");

    return res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (error) {
    console.error("Send message error:", error);

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const errorMessage = String(error?.message || "");

    return res.status(500).json({
      success: false,
      message: "Server error while sending message",
      ...(process.env.NODE_ENV !== "production"
        ? { debug: errorMessage || "Unknown send message error" }
        : {}),
    });
  }
};

export const getRoomMessages = async (req, res) => {
  try {
    const { roomName } = req.params;

    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 30), 100);
    const skip = (page - 1) * limit;

    const normalizedRoomName = normalizeRoomName(roomName);
    const room = await Room.findOne({ roomName: normalizedRoomName });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    if (!canAccessRoom(room, req.user?._id)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this room",
      });
    }

    const [messages, total] = await Promise.all([
      Message.find({ room: room._id, isDeleted: false })
        .populate("sender", "name email avatar country state city")
        .populate("room", "roomName displayName type")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Message.countDocuments({ room: room._id, isDeleted: false }),
    ]);

    return res.status(200).json({
      success: true,
      room: {
        _id: room._id,
        roomName: room.roomName,
        displayName: room.displayName,
        type: room.type,
      },
      count: messages.length,
      total,
      page,
      limit,
      messages: messages.reverse(),
    });
  } catch (error) {
    console.error("Get room messages error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching messages",
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid messageId",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.isDeleted) {
      return res.status(409).json({
        success: false,
        message: "Message is already deleted",
      });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own messages",
      });
    }

    await Message.updateOne(
      { _id: message._id, isDeleted: false },
      { $set: { isDeleted: true, text: "", attachments: [] } },
    );

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("Delete message error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting message",
    });
  }
};
