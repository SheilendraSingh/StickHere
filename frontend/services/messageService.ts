import api, { getApiErrorMessage } from "@/services/api";
import type { ChatMessage } from "@/types/message";

interface MessageEnvelope {
  success: boolean;
  message?: ChatMessage | string;
  messages?: ChatMessage[];
  total?: number;
  page?: number;
  limit?: number;
}

export const getRoomMessages = async (
  roomName: string,
  page = 1,
  limit = 30,
): Promise<ChatMessage[]> => {
  try {
    const { data } = await api.get<MessageEnvelope>(
      `/messages/${encodeURIComponent(roomName)}?page=${page}&limit=${limit}`,
    );
    return data.messages || [];
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to fetch messages"));
  }
};

export const sendMessage = async (payload: {
  roomName: string;
  text: string;
  attachments?: ChatMessage["attachments"];
  messageType?: ChatMessage["messageType"];
}): Promise<ChatMessage> => {
  try {
    const { data } = await api.post<MessageEnvelope>("/messages", payload);
    if (!data.message || typeof data.message === "string") {
      throw new Error("Message response is invalid");
    }
    return data.message;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to send message"));
  }
};

export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    await api.delete(`/messages/${messageId}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Unable to delete message"));
  }
};
