"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { io, type Socket } from "socket.io-client";
import { SOCKET_BASE_URL, SOCKET_NAMESPACE } from "@/utils/constants";
import { useAuth } from "@/hooks/useAuth";
import type { ChatMessage } from "@/types/message";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  latestRealtimeMessage: ChatMessage | null;
  joinRoom: (roomName: string) => void;
  leaveRoom: (roomName: string) => void;
  emitTyping: (roomName: string, name?: string) => void;
  emitStopTyping: (roomName: string) => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [latestRealtimeMessage, setLatestRealtimeMessage] =
    useState<ChatMessage | null>(null);

  useEffect(() => {
    if (!token || !isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    const socketClient = io(`${SOCKET_BASE_URL}${SOCKET_NAMESPACE}`, {
      auth: { token },
      transports: ["websocket"],
    });

    socketClient.on("connect", () => {
      setIsConnected(true);
      setSocket(socketClient);
      socketClient.emit("join_app");
    });

    socketClient.on("disconnect", () => {
      setIsConnected(false);
      setOnlineUsers([]);
      setSocket((current) => (current === socketClient ? null : current));
    });

    socketClient.on("online_users", (users: string[] = []) => {
      setOnlineUsers(Array.isArray(users) ? users : []);
    });

    socketClient.on("receive_message", (payload: ChatMessage) => {
      setLatestRealtimeMessage(payload);
    });

    socketRef.current = socketClient;

    return () => {
      socketClient.disconnect();
      if (socketRef.current === socketClient) {
        socketRef.current = null;
      }
    };
  }, [token, isAuthenticated]);

  const joinRoom = useCallback(
    (roomName: string) => {
      if (!socketRef.current || !roomName.trim()) return;
      socketRef.current.emit("join_room", { roomName });
    },
    [],
  );

  const leaveRoom = useCallback(
    (roomName: string) => {
      if (!socketRef.current || !roomName.trim()) return;
      socketRef.current.emit("leave_room", { roomName });
    },
    [],
  );

  const emitTyping = useCallback(
    (roomName: string, name = "") => {
      if (!socketRef.current || !roomName.trim()) return;
      socketRef.current.emit("typing", { roomName, name });
    },
    [],
  );

  const emitStopTyping = useCallback(
    (roomName: string) => {
      if (!socketRef.current || !roomName.trim()) return;
      socketRef.current.emit("stop_typing", { roomName });
    },
    [],
  );

  const value = useMemo<SocketContextValue>(
    () => ({
      socket,
      isConnected,
      onlineUsers,
      latestRealtimeMessage,
      joinRoom,
      leaveRoom,
      emitTyping,
      emitStopTyping,
    }),
    [
      socket,
      isConnected,
      onlineUsers,
      latestRealtimeMessage,
      joinRoom,
      leaveRoom,
      emitTyping,
      emitStopTyping,
    ],
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocketContext() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within SocketProvider");
  }
  return context;
}
