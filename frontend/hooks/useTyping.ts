"use client";

import { useMemo, useState } from "react";

export function useTyping() {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const startTyping = (name: string) => {
    if (!name.trim()) return;
    setTypingUsers((prev) => (prev.includes(name) ? prev : [...prev, name]));
  };

  const stopTyping = (name: string) => {
    setTypingUsers((prev) => prev.filter((user) => user !== name));
  };

  return useMemo(
    () => ({
      typingUsers,
      startTyping,
      stopTyping,
    }),
    [typingUsers],
  );
}

export default useTyping;
