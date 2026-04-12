import type { ChatMessage } from "@/types/message";
import type { User } from "@/types/user";

export const getSenderId = (message: ChatMessage): string => {
  if (typeof message.sender === "string") return message.sender;
  return message.sender?._id || "";
};

export const getSenderName = (message: ChatMessage): string => {
  if (typeof message.sender === "string") return "Unknown";
  return (message.sender as User)?.name || "Unknown";
};

export const isMessageMine = (
  message: ChatMessage,
  currentUserId?: string | null,
): boolean => {
  if (!currentUserId) return false;
  return getSenderId(message) === currentUserId;
};

export const sortMessagesByTime = (messages: ChatMessage[]): ChatMessage[] =>
  [...messages].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

export const sanitizeMessageText = (text = "") =>
  text.replace(/\s+/g, " ").trim();

export const canSendMessage = (
  text = "",
  attachments: ChatMessage["attachments"] = [],
) => sanitizeMessageText(text).length > 0 || (attachments?.length || 0) > 0;

export const buildOptimisticMessage = (params: {
  text: string;
  room?: string;
  sender: User;
  attachments?: ChatMessage["attachments"];
}): ChatMessage => ({
  _id: `temp-${Date.now()}`,
  room: params.room,
  sender: params.sender,
  text: sanitizeMessageText(params.text),
  messageType:
    params.attachments && params.attachments.length > 0
      ? params.text.trim()
        ? "mixed"
        : params.attachments[0].fileType
      : "text",
  attachments: params.attachments || [],
  createdAt: new Date().toISOString(),
});
