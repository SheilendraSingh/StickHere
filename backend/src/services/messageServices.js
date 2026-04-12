
import mongoose from "mongoose";
import Message from "../models/Message.js";
import Room from "../models/Room.js";

export class MessageServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "MessageServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const ALLOWED_MESSAGE_TYPES = new Set([
  "text",
  "image",
  "video",
  "document",
  "audio",
  "gif",
  "sticker",
  "mixed",
]);

export const normalizeRoomName = (value = "") =>
  String(value).trim().toLowerCase();

export const parsePositiveInt = (value, fallback) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

export const canAccessRoom = (room, userId) => {
  if (!room?.isPrivate) return true;
  if (!userId) return false;
  return room.users?.some((id) => id.toString() === userId.toString());
};

export const sendMessageService = async ({
  roomName,
  text,
  attachments = [],
  messageType = "text",
  senderId,
} = {}) => {
  if (!senderId) {
    throw new MessageServiceError("Unauthorized", 401);
  }

  if (!roomName) {
    throw new MessageServiceError("roomName is required", 400);
  }

  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (!hasText && !hasAttachments) {
    throw new MessageServiceError(
      "Message must contain text or attachments",
      400,
    );
  }

  const normalizedMessageType = String(messageType).trim().toLowerCase();
  if (!ALLOWED_MESSAGE_TYPES.has(normalizedMessageType)) {
    throw new MessageServiceError("Invalid messageType", 400);
  }

  const room = await Room.findOne({ roomName: normalizeRoomName(roomName) });
  if (!room) {
    throw new MessageServiceError("Room not found", 404);
  }

  if (!canAccessRoom(room, senderId)) {
    throw new MessageServiceError(
      "You are not allowed to post in this room",
      403,
    );
  }

  const finalMessageType =
    hasAttachments && hasText && normalizedMessageType === "text"
      ? "mixed"
      : normalizedMessageType;

  const message = await Message.create({
    sender: senderId,
    room: room._id,
    text: hasText ? text.trim() : "",
    messageType: finalMessageType,
    attachments: hasAttachments ? attachments : [],
  });

  room.latestMessage = message._id;
  await room.save();

  return Message.findById(message._id)
    .populate("sender", "name email avatar country state city")
    .populate("room", "roomName displayName type");
};

export const getRoomMessagesService = async ({
  roomName,
  userId,
  page = 1,
  limit = 30,
} = {}) => {
  if (!roomName) {
    throw new MessageServiceError("roomName is required", 400);
  }

  const parsedPage = parsePositiveInt(page, 1);
  const parsedLimit = Math.min(parsePositiveInt(limit, 30), 100);
  const skip = (parsedPage - 1) * parsedLimit;

  const room = await Room.findOne({ roomName: normalizeRoomName(roomName) });
  if (!room) {
    throw new MessageServiceError("Room not found", 404);
  }

  if (!canAccessRoom(room, userId)) {
    throw new MessageServiceError(
      "You are not allowed to view this room",
      403,
    );
  }

  const [messages, total] = await Promise.all([
    Message.find({ room: room._id, isDeleted: false })
      .populate("sender", "name email avatar country state city")
      .populate("room", "roomName displayName type")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),
    Message.countDocuments({ room: room._id, isDeleted: false }),
  ]);

  return {
    room: {
      _id: room._id,
      roomName: room.roomName,
      displayName: room.displayName,
      type: room.type,
    },
    count: messages.length,
    total,
    page: parsedPage,
    limit: parsedLimit,
    messages: messages.reverse(),
  };
};

export const deleteMessageService = async ({ messageId, userId } = {}) => {
  if (!userId) {
    throw new MessageServiceError("Unauthorized", 401);
  }

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new MessageServiceError("Invalid messageId", 400);
  }

  const message = await Message.findById(messageId);
  if (!message) {
    throw new MessageServiceError("Message not found", 404);
  }

  if (message.isDeleted) {
    throw new MessageServiceError("Message is already deleted", 409);
  }

  if (message.sender.toString() !== userId.toString()) {
    throw new MessageServiceError(
      "You can delete only your own messages",
      403,
    );
  }

  await Message.updateOne(
    { _id: message._id, isDeleted: false },
    { $set: { isDeleted: true, text: "", attachments: [] } },
  );

  return { success: true };
};
