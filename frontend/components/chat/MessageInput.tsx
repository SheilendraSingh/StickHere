"use client";

import { useState, type FormEvent } from "react";
import Button from "@/components/common/Button";

interface MessageInputProps {
  onSend: (text: string) => Promise<void> | void;
  disabled?: boolean;
  isSending?: boolean;
}

export default function MessageInput({
  onSend,
  disabled = false,
  isSending = false,
}: MessageInputProps) {
  const [text, setText] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    await onSend(trimmed);
    setText("");
  };

  return (
    <form onSubmit={submit} className="flex gap-2 border-t border-zinc-200 bg-white p-3">
      <input
        className="h-11 flex-1 rounded-md border border-zinc-300 px-3 text-sm text-zinc-900 outline-none ring-sky-500 focus:border-sky-500 focus:ring-2"
        placeholder="Type a message..."
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled || isSending}
      />
      <Button type="submit" isLoading={isSending} disabled={disabled}>
        Send
      </Button>
    </form>
  );
}
