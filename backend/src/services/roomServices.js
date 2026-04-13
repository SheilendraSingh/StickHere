
import Room from "../models/Room.js";

export class RoomServiceError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.name = "RoomServiceError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const normalizeRoomName = (value = "") =>
  String(value).trim().toLowerCase();

export const buildDisplayName = ({
  type,
  country = "",
  state = "",
  city = "",
} = {}) => {
  if (type === "world") return "World Chat";
  if (type === "country") return country;
  if (type === "state") return `${state}, ${country}`;
  if (type === "city") return `${city}, ${state}, ${country}`;
  return "Chat Room";
};

export const getOrCreateRoomService = async ({
  roomName,
  type,
  country = "",
  state = "",
  city = "",
  description = "",
  createdBy = null,
} = {}) => {
  if (!roomName || !type) {
    throw new RoomServiceError("roomName and type are required", 400);
  }

  const normalizedRoomName = normalizeRoomName(roomName);
  const normalizedType = String(type).trim().toLowerCase();

  const payload = {
    roomName: normalizedRoomName,
    displayName: buildDisplayName({
      type: normalizedType,
      country,
      state,
      city,
    }),
    type: normalizedType,
    country,
    state,
    city,
    description,
    createdBy,
  };

  try {
    return await Room.findOneAndUpdate(
      { roomName: normalizedRoomName },
      { $setOnInsert: payload },
      { returnDocument: "after", upsert: true, runValidators: true },
    );
  } catch (error) {
    if (error.name === "ValidationError" || error.name === "CastError") {
      throw new RoomServiceError(error.message, 400, error);
    }

    if (error.code === 11000) {
      const existing = await Room.findOne({ roomName: normalizedRoomName });
      if (existing) return existing;
    }

    throw new RoomServiceError("Server error while creating room", 500, error);
  }
};

export const getRoomByNameService = async (roomName) => {
  const normalizedRoomName = normalizeRoomName(roomName);
  if (!normalizedRoomName) {
    throw new RoomServiceError("roomName is required", 400);
  }

  const room = await Room.findOne({ roomName: normalizedRoomName });
  if (!room) {
    throw new RoomServiceError("Room not found", 404);
  }

  return room;
};

export const getMyRoomsService = async (user) => {
  if (!user) {
    throw new RoomServiceError("Unauthorized", 401);
  }

  const rooms = [{ roomName: "world", type: "world", displayName: "World Chat" }];

  if (user.country) {
    rooms.push({
      roomName: user.country.toLowerCase(),
      type: "country",
      displayName: user.country,
    });
  }

  if (user.country && user.state) {
    rooms.push({
      roomName: `${user.country.toLowerCase()}-${user.state.toLowerCase()}`,
      type: "state",
      displayName: `${user.state}, ${user.country}`,
    });
  }

  if (user.country && user.state && user.city) {
    rooms.push({
      roomName: `${user.country.toLowerCase()}-${user.state.toLowerCase()}-${user.city.toLowerCase()}`,
      type: "city",
      displayName: `${user.city}, ${user.state}, ${user.country}`,
    });
  }

  return rooms;
};
