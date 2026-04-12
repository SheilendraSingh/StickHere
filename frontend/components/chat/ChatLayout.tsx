"use client";

import { useMemo } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSidebar from "@/components/chat/ChatSidebar";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import TypingIndicator from "@/components/chat/TypingIndicator";
import OnlineUsers from "@/components/chat/OnlineUsers";
import useRooms from "@/hooks/useRooms";
import useMessages from "@/hooks/useMessages";
import useTyping from "@/hooks/useTyping";
import { useAuth } from "@/hooks/useAuth";

export default function ChatLayout() {
  const { user, logout } = useAuth();
  const { rooms, activeRoom, setActiveRoom, isLoading: isRoomLoading, error: roomError } =
    useRooms();
  const {
    messages,
    isLoading: isMessageLoading,
    isSending,
    error: messageError,
    send,
  } = useMessages(activeRoom?.roomName || null);
  const { typingUsers } = useTyping();

  const onlineUsers = useMemo(() => (user ? [user] : []), [user]);

  return (
    <main className="flex h-[100svh] bg-[#091413]">
      <ChatSidebar
        rooms={rooms}
        activeRoom={activeRoom}
        onSelectRoom={setActiveRoom}
        isLoading={isRoomLoading}
      />
      <section className="flex min-w-0 flex-1 flex-col bg-[#091413]/70">
        <ChatHeader room={activeRoom} />

        <div className="flex items-center justify-between border-b border-[#408A71]/45 bg-[#285A48]/80 px-4 py-2 text-xs text-[#B0E4CC]/90">
          <span>{roomError || messageError || "Connected"}</span>
          <button
            type="button"
            onClick={() => void logout()}
            className="rounded border border-[#408A71]/60 bg-[#091413]/60 px-2 py-1 font-semibold text-[#B0E4CC] hover:bg-[#091413]"
          >
            Logout
          </button>
        </div>

        <MessageList
          messages={messages}
          currentUserId={user?._id}
          isLoading={isMessageLoading}
        />
        <TypingIndicator users={typingUsers} />
        <MessageInput
          onSend={async (text) => {
            await send(text);
          }}
          disabled={!activeRoom}
          isSending={isSending}
        />
      </section>
      <OnlineUsers users={onlineUsers} />
    </main>
  );
}
