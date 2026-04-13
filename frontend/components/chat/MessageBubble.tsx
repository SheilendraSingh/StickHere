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
  const attachments = Array.isArray(message.attachments) ? message.attachments : [];
  const text = typeof message.text === "string" ? message.text.trim() : "";
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
        {text ? <p className="whitespace-pre-wrap text-sm">{text}</p> : null}

        {attachments.length ? (
          <div className={`${text ? "mt-2" : ""} space-y-2`}>
            {attachments.map((attachment, index) => {
              const key = `${attachment.url}-${index}`;

              if (attachment.fileType === "video") {
                return (
                  <video
                    key={key}
                    src={attachment.url}
                    controls
                    className="max-h-72 w-full rounded-md border border-[#408A71]/70 bg-black"
                  />
                );
              }

              if (attachment.fileType === "audio") {
                return (
                  <audio
                    key={key}
                    src={attachment.url}
                    controls
                    className="w-full rounded-md border border-[#408A71]/70"
                  />
                );
              }

              if (
                attachment.fileType === "image" ||
                attachment.fileType === "gif" ||
                attachment.fileType === "sticker"
              ) {
                const stickerClass =
                  attachment.fileType === "sticker"
                    ? "max-h-56 w-full rounded-md border border-[#408A71]/70 bg-[#091413]/45 object-contain p-2"
                    : "max-h-72 w-full rounded-md border border-[#408A71]/70 object-cover";

                return (
                  <img
                    key={key}
                    src={attachment.url}
                    alt={attachment.filename || attachment.fileType}
                    className={stickerClass}
                  />
                );
              }

              return (
                <a
                  key={key}
                  href={attachment.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-md border border-[#408A71]/70 bg-[#091413]/35 px-3 py-2 text-sm underline decoration-[#B0E4CC]/70 underline-offset-2 hover:bg-[#091413]/55"
                >
                  {attachment.filename || "Open attachment"}
                </a>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
