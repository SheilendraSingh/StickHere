import type { Room, RoomType } from "@/types/room";

export const normalizeRoomName = (value = "") =>
  value.trim().toLowerCase().replace(/\s+/g, "-");

export const buildRoomNameFromLocation = (params: {
  type: RoomType;
  country?: string;
  state?: string;
  city?: string;
}): string => {
  const country = normalizeRoomName(params.country || "");
  const state = normalizeRoomName(params.state || "");
  const city = normalizeRoomName(params.city || "");

  if (params.type === "world") return "world";
  if (params.type === "country") return country;
  if (params.type === "state") return `${country}-${state}`;
  if (params.type === "city") return `${country}-${state}-${city}`;
  return "group";
};

export const buildRoomDisplayName = (room: Partial<Room>): string => {
  if (room.type === "world") return "World Chat";
  if (room.displayName) return room.displayName;
  if (room.type === "country") return room.country || "Country Chat";
  if (room.type === "state") return `${room.state || "State"}, ${room.country || "Country"}`;
  if (room.type === "city") {
    return `${room.city || "City"}, ${room.state || "State"}, ${room.country || "Country"}`;
  }
  return "Chat Room";
};

export const findRoomByName = (rooms: Room[], roomName: string) =>
  rooms.find((room) => room.roomName === roomName) || null;
