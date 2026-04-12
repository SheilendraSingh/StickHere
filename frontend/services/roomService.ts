import api, { getApiErrorMessage } from "@/services/api";
import type { Room } from "@/types/room";

interface RoomEnvelope {
  success: boolean;
  room?: Room;
  rooms?: Room[];
  message?: string;
}

export const getMyRooms = async (): Promise<Room[]> => {
  try {
    const { data } = await api.get<RoomEnvelope>("/rooms/my-rooms");
    return data.rooms || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to fetch rooms"));
  }
};

export const getRoomByName = async (roomName: string): Promise<Room> => {
  try {
    const { data } = await api.get<RoomEnvelope>(
      `/rooms/${encodeURIComponent(roomName)}`,
    );
    if (!data.room) throw new Error("Room not found");
    return data.room;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to fetch room"));
  }
};

export const getOrCreateRoom = async (payload: {
  roomName: string;
  type: Room["type"];
  country?: string;
  state?: string;
  city?: string;
  description?: string;
}): Promise<Room> => {
  try {
    const { data } = await api.post<RoomEnvelope>("/rooms", payload);
    if (!data.room) throw new Error("Room response is invalid");
    return data.room;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to create room"));
  }
};
