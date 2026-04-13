"use client";

import type { Attachment } from "@/types/message";

interface FilePreviewProps {
  file: Attachment;
  onRemove?: () => void;
}

const formatSize = (size = 0) => {
  if (!size) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = size;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
};

export default function FilePreview({ file, onRemove }: FilePreviewProps) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[#408A71]/60 bg-[#285A48] px-3 py-2 text-[#B0E4CC]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{file.filename || "Attachment"}</p>
        <p className="text-xs text-[#B0E4CC]/75">
          {file.fileType.toUpperCase()} - {formatSize(file.size || 0)}
        </p>
      </div>
      {onRemove ? (
        <button
          type="button"
          onClick={onRemove}
          className="rounded border border-[#408A71]/70 px-2 py-1 text-xs hover:bg-[#091413]/45"
        >
          Remove
        </button>
      ) : null}
    </div>
  );
}
