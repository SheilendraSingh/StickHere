import type { User } from "@/types/user";

export interface Attachment {
  url: string;
  fileType: "image" | "video" | "document" | "audio" | "gif" | "sticker";
  filename?: string;
  mimeType?: string;
  size?: number;
  durationSeconds?: number;
}

export interface ChatMessage {
  _id: string;
  room?: string;
  sender: User | string;
  text: string;
  messageType:
    | "text"
    | "image"
    | "video"
    | "document"
    | "audio"
    | "gif"
    | "sticker"
    | "mixed";
  attachments?: Attachment[];
  createdAt: string;
  updatedAt?: string;
}
