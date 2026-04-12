"use client";

export type AttachmentType =
  | "image"
  | "video"
  | "document"
  | "audio"
  | "gif"
  | "sticker";

interface AttachmentMenuProps {
  onSelect: (type: AttachmentType) => void;
  disabled?: boolean;
}

const options: Array<{ type: AttachmentType; label: string }> = [
  { type: "image", label: "Image" },
  { type: "video", label: "Video" },
  { type: "document", label: "Document" },
  { type: "audio", label: "Audio" },
  { type: "gif", label: "GIF" },
  { type: "sticker", label: "Sticker" },
];

export default function AttachmentMenu({
  onSelect,
  disabled = false,
}: AttachmentMenuProps) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {options.map((option) => (
        <button
          key={option.type}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(option.type)}
          className="rounded-md border border-[#408A71]/70 bg-[#285A48] px-2 py-2 text-xs font-medium text-[#B0E4CC] transition hover:bg-[#408A71] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
