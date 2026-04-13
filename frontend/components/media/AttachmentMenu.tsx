"use client";

export type AttachmentType =
  | "media"
  | "image"
  | "video"
  | "document"
  | "audio"
  | "camera"
  | "gif"
  | "sticker";

interface AttachmentMenuProps {
  onSelect: (type: AttachmentType) => void;
  disabled?: boolean;
}

const options: Array<{
  type: AttachmentType;
  label: string;
  dotClass: string;
}> = [
  { type: "document", label: "Document", dotClass: "bg-[#9A8BFF]" },
  { type: "media", label: "Photos & videos", dotClass: "bg-[#3FA9FF]" },
  { type: "camera", label: "Camera", dotClass: "bg-[#FF4FA0]" },
  { type: "audio", label: "Audio", dotClass: "bg-[#FF8C3A]" },
];

export default function AttachmentMenu({
  onSelect,
  disabled = false,
}: AttachmentMenuProps) {
  return (
    <div className="w-56 rounded-2xl border border-[#2A2F33] bg-[#161A1F] p-2 shadow-2xl shadow-black/50">
      {options.map((option) => (
        <button
          key={option.type}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.type)}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#D8DEE5] transition hover:bg-[#222831] disabled:cursor-not-allowed disabled:opacity-45"
          title={option.label}
        >
          <span
            aria-hidden
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${option.dotClass}`}
          />
          <span>{option.label}</span>
        </button>
      ))}
    </div>
  );
}
