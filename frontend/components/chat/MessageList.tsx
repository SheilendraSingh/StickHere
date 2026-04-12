import type { ChatMessage } from "@/types/message";
import MessageBubble from "@/components/chat/MessageBubble";
import EmptyChatState from "@/components/chat/EmptyChatState";

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId?: string;
  isLoading?: boolean;
}

export default function MessageList({
  messages,
  currentUserId,
  isLoading = false,
}: MessageListProps) {
  if (isLoading) {
    return <div className="p-4 text-sm text-zinc-500">Loading messages...</div>;
  }

  if (messages.length === 0) {
    return <EmptyChatState />;
  }

  return (
    <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
      {messages.map((message) => (
        <MessageBubble
          key={message._id}
          message={message}
          currentUserId={currentUserId}
        />
      ))}
    </div>
  );
}
