import Room from "../models/Room.js";

const normalizeRoomName = (value = "") => String(value).trim().toLowerCase();

const buildDisplayName = ({ type, country = "", state = "", city = "" }) => {
  if (type === "world") return "World Chat";
  if (type === "country") return country;
  if (type === "state") return `${state}, ${country}`;
  if (type === "city") return `${city}, ${state}, ${country}`;
  return "Chat Room";
};

export const getOrCreateRoom = async (req, res) => {
  try {
    const { roomName, type, country, state, city, description } = req.body;

    if (!roomName || !type) {
      return res.status(400).json({
        success: false,
        message: "roomName and type are required",
      });
    }

    const normalizedRoomName = normalizeRoomName(roomName);
    const normalizedType = String(type).trim().toLowerCase();

    const payload = {
      roomName: normalizedRoomName,
      displayName: buildDisplayName({
        type: normalizedType,
        country: country || "",
        state: state || "",
        city: city || "",
      }),
      type: normalizedType,
      country: country || "",
      state: state || "",
      city: city || "",
      description: description || "",
      createdBy: req.user?._id || null,
    };

    // Atomic upsert to avoid duplicate-create race conditions
    const room = await Room.findOneAndUpdate(
      { roomName: normalizedRoomName },
      { $setOnInsert: payload },
      { returnDocument: "after", upsert: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get/Create room error:", error.message);

    // Validation / bad input
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    // Duplicate key safety
    if (error.code === 11000) {
      const room = await Room.findOne({
        roomName: normalizeRoomName(req.body?.roomName),
      });
      return res.status(200).json({
        success: true,
        room,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while creating room",
    });
  }
};

export const getRoomByName = async (req, res) => {
  try {
    const { roomName } = req.params;
    const normalizedRoomName = normalizeRoomName(roomName);

    const room = await Room.findOne({ roomName: normalizedRoomName });

    if (!room) {
      return res.status(404).json({
        success: false,
        message: "Room not found",
      });
    }

    return res.status(200).json({
      success: true,
      room,
    });
  } catch (error) {
    console.error("Get room error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching room",
    });
  }
};

export const getMyRooms = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const country = typeof req.user.country === "string" ? req.user.country.trim() : "";
    const state = typeof req.user.state === "string" ? req.user.state.trim() : "";
    const city = typeof req.user.city === "string" ? req.user.city.trim() : "";

    const roomDescriptors = [
      {
        roomName: "world",
        displayName: "World Chat",
        type: "world",
        country: "",
        state: "",
        city: "",
      },
    ];

    if (country.length >= 2) {
      roomDescriptors.push({
        roomName: country.toLowerCase(),
        type: "country",
        displayName: country,
        country,
        state: "",
        city: "",
      });
    }

    if (country.length >= 2 && state.length >= 2) {
      roomDescriptors.push({
        roomName: `${country.toLowerCase()}-${state.toLowerCase()}`,
        type: "state",
        displayName: `${state}, ${country}`,
        country,
        state,
        city: "",
      });
    }

    if (country.length >= 2 && state.length >= 2 && city.length >= 2) {
      roomDescriptors.push({
        roomName: `${country.toLowerCase()}-${state.toLowerCase()}-${city.toLowerCase()}`,
        type: "city",
        displayName: `${city}, ${state}, ${country}`,
        country,
        state,
        city,
      });
    }

    // Ensure all default/user location rooms exist in DB before returning.
    const rooms = await Promise.all(
      roomDescriptors.map(async (room) =>
        Room.findOneAndUpdate(
          { roomName: normalizeRoomName(room.roomName) },
          {
            $setOnInsert: {
              roomName: normalizeRoomName(room.roomName),
              displayName: room.displayName,
              type: room.type,
              country: room.country,
              state: room.state,
              city: room.city,
              description: "",
              createdBy: null,
            },
          },
          {
            returnDocument: "after",
            upsert: true,
            runValidators: true,
          },
        ),
      ),
    );

    return res.status(200).json({
      success: true,
      rooms,
    });
  } catch (error) {
    console.error("Get my rooms error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user rooms",
    });
  }
};
