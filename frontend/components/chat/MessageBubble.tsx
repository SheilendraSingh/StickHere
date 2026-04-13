import type { ChatMessage } from "@/types/message";
import type { User } from "@/types/user";

interface MessageBubbleProps {
  message: ChatMessage;
  currentUserId?: string;
  alignMode?: "room" | "direct";
}

const getSenderName = (sender: ChatMessage["sender"], isMine: boolean) => {
  if (isMine) return "You";
  if (!sender) return "Unknown";
  if (typeof sender === "string") return "User";
  return (sender as User).name || "Unknown";
};

const formatMessageTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function MessageBubble({
  message,
  currentUserId,
  alignMode = "room",
}: MessageBubbleProps) {
  const senderId =
    typeof message.sender === "string" ? message.sender : message.sender?._id;
  const isMine = Boolean(currentUserId && senderId === currentUserId);
  const senderName = getSenderName(message.sender, isMine);
  const createdTime = formatMessageTime(message.createdAt);
  const isRightAligned = alignMode === "direct" && isMine;
  const bubbleClass =
    alignMode === "direct" && isMine
      ? "bg-[#408A71] text-[#B0E4CC]"
      : "bg-[#285A48] text-[#B0E4CC]";

  return (
    <div className={`flex ${isRightAligned ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] rounded-2xl px-3 py-2 ${bubbleClass}`}>
        <div className="mb-1 flex items-center gap-2 text-xs opacity-80">
          <p className="font-semibold">{senderName}</p>
          {createdTime ? <p>{createdTime}</p> : null}
        </div>
        <p className="whitespace-pre-wrap text-sm">{message.text || " "}</p>
      </div>
    </div>
  );
}
