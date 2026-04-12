"use client";

import type { Attachment } from "@/types/message";

interface MediaPreviewProps {
  attachments: Attachment[];
}

export default function MediaPreview({ attachments }: MediaPreviewProps) {
  if (!attachments.length) return null;

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {attachments.map((attachment, index) => (
        <div
          key={`${attachment.url}-${index}`}
          className="rounded-md border border-[#408A71]/60 bg-[#285A48]/85 p-2 text-[#B0E4CC]"
        >
          {attachment.fileType === "image" || attachment.fileType === "gif" ? (
            <img
              src={attachment.url}
              alt={attachment.filename || "Attachment"}
              className="h-36 w-full rounded object-cover"
            />
          ) : (
            <div className="flex h-36 items-center justify-center rounded bg-[#091413]/40 text-sm">
              {attachment.fileType.toUpperCase()}
            </div>
          )}
          <p className="mt-2 truncate text-xs">{attachment.filename || attachment.fileType}</p>
        </div>
      ))}
    </div>
  );
}
