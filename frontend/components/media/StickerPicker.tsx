"use client";

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
}

const stickers = [
  "/stickers/sticker-1.png",
  "/stickers/sticker-2.png",
  "/stickers/sticker-3.png",
  "/stickers/sticker-4.png",
];

export default function StickerPicker({ onSelect }: StickerPickerProps) {
  return (
    <div className="grid grid-cols-4 gap-2 rounded-md border border-[#408A71]/50 bg-[#285A48]/70 p-2">
      {stickers.map((sticker) => (
        <button
          key={sticker}
          type="button"
          onClick={() => onSelect(sticker)}
          className="rounded border border-[#408A71]/60 bg-[#091413]/45 p-2 hover:border-[#B0E4CC]"
        >
          <img
            src={sticker}
            alt="Sticker"
            className="h-12 w-12 object-contain"
            onError={(event) => {
              const target = event.currentTarget;
              target.style.display = "none";
            }}
          />
        </button>
      ))}
    </div>
  );
}
