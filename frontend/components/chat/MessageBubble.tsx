import type { ChatMessage } from "@/types/message";
import type { User } from "@/types/user";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId?: string;
}

const getSenderName = (sender: ChatMessage["sender"]) => {
  if (!sender) return "Unknown";
  if (typeof sender === "string") return "You";
  return (sender as User).name || "Unknown";
};

export default function MessageBubble({
  message,
  currentUserId,
}: MessageBubbleProps) {
  const senderId =
    typeof message.sender === "string" ? message.sender : message.sender?._id;
  const isMine = Boolean(currentUserId && senderId === currentUserId);

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 ${
          isMine ? "bg-sky-600 text-white" : "bg-zinc-100 text-zinc-900"
        }`}
      >
        {!isMine ? (
          <p className="mb-1 text-xs font-semibold opacity-80">
            {getSenderName(message.sender)}
          </p>
        ) : null}
        <p className="whitespace-pre-wrap text-sm">{message.text || " "}</p>
      </div>
    </div>
  );
}
