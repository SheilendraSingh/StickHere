"use client";

import { useEffect, useMemo, useState } from "react";
import type { Room } from "@/types/room";
import { getMyRooms } from "@/services/roomService";

export function useRooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const list = await getMyRooms();
        if (!mounted) return;
        setRooms(list);
        setActiveRoom((prev) => prev || list[0] || null);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Unable to load rooms");
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    void fetchRooms();
    return () => {
      mounted = false;
    };
  }, []);

  return useMemo(
    () => ({
      rooms,
      activeRoom,
      setActiveRoom,
      isLoading,
      error,
    }),
    [rooms, activeRoom, isLoading, error],
  );
}

export default useRooms;
