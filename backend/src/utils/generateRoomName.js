
export const ROOM_TYPES = Object.freeze([
  "world",
  "country",
  "state",
  "city",
  "group",
]);

export class RoomNameError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "RoomNameError";
    this.statusCode = statusCode;
  }
}

const collapseDashes = (value = "") => value.replace(/-+/g, "-");

export const normalizeRoomSegment = (value = "") =>
  collapseDashes(
    String(value)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-"),
  );

export const normalizeDisplaySegment = (value = "") => String(value).trim();

export const buildRoomDisplayName = ({
  type,
  country = "",
  state = "",
  city = "",
  customName = "",
} = {}) => {
  if (type === "world") return "World Chat";
  if (type === "country") return normalizeDisplaySegment(country);
  if (type === "state") {
    return `${normalizeDisplaySegment(state)}, ${normalizeDisplaySegment(country)}`;
  }
  if (type === "city") {
    return `${normalizeDisplaySegment(city)}, ${normalizeDisplaySegment(state)}, ${normalizeDisplaySegment(country)}`;
  }
  if (type === "group") return normalizeDisplaySegment(customName) || "Group Chat";
  return "Chat Room";
};

export const generateRoomName = ({
  type = "world",
  country = "",
  state = "",
  city = "",
  customName = "",
} = {}) => {
  const normalizedType = String(type).trim().toLowerCase();
  if (!ROOM_TYPES.includes(normalizedType)) {
    throw new RoomNameError(`Invalid room type: ${type}`);
  }

  const normalizedCountry = normalizeRoomSegment(country);
  const normalizedState = normalizeRoomSegment(state);
  const normalizedCity = normalizeRoomSegment(city);
  const normalizedCustomName = normalizeRoomSegment(customName);

  if (normalizedType === "world") {
    return {
      roomName: "world",
      displayName: "World Chat",
      type: "world",
      country: "",
      state: "",
      city: "",
    };
  }

  if (normalizedType === "country") {
    if (!normalizedCountry) {
      throw new RoomNameError("Country is required for country rooms");
    }
    return {
      roomName: normalizedCountry,
      displayName: buildRoomDisplayName({
        type: "country",
        country,
      }),
      type: "country",
      country: normalizeDisplaySegment(country),
      state: "",
      city: "",
    };
  }

  if (normalizedType === "state") {
    if (!normalizedCountry || !normalizedState) {
      throw new RoomNameError("Country and state are required for state rooms");
    }
    return {
      roomName: `${normalizedCountry}-${normalizedState}`,
      displayName: buildRoomDisplayName({
        type: "state",
        country,
        state,
      }),
      type: "state",
      country: normalizeDisplaySegment(country),
      state: normalizeDisplaySegment(state),
      city: "",
    };
  }

  if (normalizedType === "city") {
    if (!normalizedCountry || !normalizedState || !normalizedCity) {
      throw new RoomNameError(
        "Country, state, and city are required for city rooms",
      );
    }
    return {
      roomName: `${normalizedCountry}-${normalizedState}-${normalizedCity}`,
      displayName: buildRoomDisplayName({
        type: "city",
        country,
        state,
        city,
      }),
      type: "city",
      country: normalizeDisplaySegment(country),
      state: normalizeDisplaySegment(state),
      city: normalizeDisplaySegment(city),
    };
  }

  if (!normalizedCustomName) {
    throw new RoomNameError("customName is required for group rooms");
  }

  return {
    roomName: `group-${normalizedCustomName}`,
    displayName: buildRoomDisplayName({
      type: "group",
      customName,
    }),
    type: "group",
    country: "",
    state: "",
    city: "",
  };
};

export const getUserScopedRooms = (user = {}) => {
  const rooms = [{ roomName: "world", type: "world", displayName: "World Chat" }];

  if (user.country) {
    rooms.push(
      generateRoomName({
        type: "country",
        country: user.country,
      }),
    );
  }

  if (user.country && user.state) {
    rooms.push(
      generateRoomName({
        type: "state",
        country: user.country,
        state: user.state,
      }),
    );
  }

  if (user.country && user.state && user.city) {
    rooms.push(
      generateRoomName({
        type: "city",
        country: user.country,
        state: user.state,
        city: user.city,
      }),
    );
  }

  return rooms;
};

export default {
  ROOM_TYPES,
  RoomNameError,
  normalizeRoomSegment,
  normalizeDisplaySegment,
  buildRoomDisplayName,
  generateRoomName,
  getUserScopedRooms,
};
