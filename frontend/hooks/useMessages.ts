"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Attachment, ChatMessage } from "@/types/message";
import { getRoomMessages, sendMessage } from "@/services/messageService";

interface SendPayload {
  text?: string;
  attachments?: Attachment[];
  messageType?: ChatMessage["messageType"];
}

const resolveMessageType = (
  text: string,
  attachments: Attachment[],
  requested?: ChatMessage["messageType"],
): ChatMessage["messageType"] => {
  if (requested) return requested;
  if (!attachments.length) return "text";
  if (text) return "mixed";
  if (attachments.length > 1) return "mixed";
  return attachments[0]?.fileType || "mixed";
};

export function useMessages(roomName: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!roomName) return;
    try {
      setIsLoading(true);
      setError(null);
      const list = await getRoomMessages(roomName);
      setMessages(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load messages");
    } finally {
      setIsLoading(false);
    }
  }, [roomName]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const send = useCallback(
    async (payload: SendPayload) => {
      if (!roomName) return;

      const trimmedText = String(payload.text || "").trim();
      const attachments = Array.isArray(payload.attachments)
        ? payload.attachments.filter((item) => Boolean(item?.url))
        : [];

      if (!trimmedText && attachments.length === 0) return;

      try {
        setIsSending(true);
        setError(null);
        const created = await sendMessage({
          roomName,
          text: trimmedText,
          attachments,
          messageType: resolveMessageType(
            trimmedText,
            attachments,
            payload.messageType,
          ),
        });
        setMessages((prev) => [...prev, created]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to send message");
      } finally {
        setIsSending(false);
      }
    },
    [roomName],
  );

  return useMemo(
    () => ({
      messages,
      isLoading,
      isSending,
      error,
      reload,
      send,
    }),
    [messages, isLoading, isSending, error, reload, send],
  );
}

export default useMessages;
