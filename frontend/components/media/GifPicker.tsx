"use client";

import { useMemo, useState } from "react";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const fallbackGifs = [
  "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDNuOHhlcnF0czQ2YTFjM2I5c3h0dGtza3QxZXJodnZnMHl3bWlmZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif",
  "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTZ0NW9pbnB4N2I4a3h5ZmVvNG5rbGd0MHNpdXF5OG14MHEzOGZjdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKTDn976rzVgky4/giphy.gif",
  "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2p6bXQ4dnN4dTVqenR4enVjYnd6MXQ0YW42YW95d2VjMGswaGRzYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlBO7eyXzSZkJri/giphy.gif",
];

export default function GifPicker({ onSelect }: GifPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return fallbackGifs;
    return fallbackGifs.filter((gif) =>
      gif.toLowerCase().includes(query.trim().toLowerCase()),
    );
  }, [query]);

  return (
    <div className="space-y-2">
      <input
        className="h-10 w-full rounded-md border border-[#408A71] bg-[#091413]/70 px-3 text-sm text-[#B0E4CC] placeholder:text-[#B0E4CC]/60"
        placeholder="Search GIF (starter)"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <div className="grid max-h-60 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-[#408A71]/50 bg-[#285A48]/70 p-2">
        {filtered.map((gif) => (
          <button
            key={gif}
            type="button"
            onClick={() => onSelect(gif)}
            className="overflow-hidden rounded border border-[#408A71]/60 hover:border-[#B0E4CC]"
          >
            <img src={gif} alt="GIF option" className="h-20 w-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
