"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ChatMessage } from "@/types/message";
import { getRoomMessages, sendMessage } from "@/services/messageService";

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
    async (text: string) => {
      if (!roomName || !text.trim()) return;
      try {
        setIsSending(true);
        setError(null);
        const created = await sendMessage({
          roomName,
          text,
          messageType: "text",
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
