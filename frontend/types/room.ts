export type RoomType = "world" | "country" | "state" | "city" | "group";

export interface Room {
  _id?: string;
  roomName: string;
  displayName: string;
  type: RoomType;
  country?: string;
  state?: string;
  city?: string;
  description?: string;
}
