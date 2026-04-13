"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTrendingStickers,
  searchStickers,
  type GifItem,
} from "@/services/gifService";

interface StickerPickerProps {
  onSelect: (stickerUrl: string) => void;
}

const fallbackStickerSeeds = [
  { id: "party", symbol: "🎉", label: "Party", bg: "#F9D66C" },
  { id: "heart", symbol: "❤️", label: "Heart", bg: "#F6A6B2" },
  { id: "cool", symbol: "😎", label: "Cool", bg: "#8ED4C6" },
  { id: "thumbs-up", symbol: "👍", label: "Thumbs Up", bg: "#C3E78D" },
  { id: "fire", symbol: "🔥", label: "Fire", bg: "#F8B06D" },
  { id: "laugh", symbol: "😂", label: "Laugh", bg: "#FDE987" },
  { id: "clap", symbol: "👏", label: "Clap", bg: "#B9C9FF" },
  { id: "rocket", symbol: "🚀", label: "Rocket", bg: "#B3E2FF" },
];

const toStickerDataUri = (symbol: string, background: string) => {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 96 96'><rect width='96' height='96' rx='20' fill='${background}'/><text x='50%' y='57%' dominant-baseline='middle' text-anchor='middle' font-size='46'>${symbol}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const fallbackStickers: GifItem[] = fallbackStickerSeeds.map((item) => ({
  id: item.id,
  title: item.label,
  url: toStickerDataUri(item.symbol, item.bg),
  previewUrl: toStickerDataUri(item.symbol, item.bg),
  width: 96,
  height: 96,
  durationSeconds: 0,
  tags: [],
}));

export default function StickerPicker({ onSelect }: StickerPickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<GifItem[]>(fallbackStickers);
  const [nextCursor, setNextCursor] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  const load = useCallback(
    async (cursor = "", append = false) => {
      const isSearch = debouncedQuery.length > 0;

      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const payload = isSearch
          ? await searchStickers(debouncedQuery, { pos: cursor, limit: 24 })
          : await getTrendingStickers({ pos: cursor, limit: 24 });

        setResults((prev) => (append ? [...prev, ...payload.results] : payload.results));
        setNextCursor(payload.next || "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load stickers";
        setError(message);
        if (!append) {
          setResults(isSearch ? [] : fallbackStickers);
          setNextCursor("");
        }
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [debouncedQuery],
  );

  useEffect(() => {
    void load("", false);
  }, [load]);

  const canLoadMore = useMemo(
    () => Boolean(nextCursor) && !isLoading && !isLoadingMore,
    [isLoading, isLoadingMore, nextCursor],
  );

  return (
    <div className="space-y-2">
      <input
        className="h-10 w-full rounded-md border border-[#408A71] bg-[#091413]/70 px-3 text-sm text-[#B0E4CC] placeholder:text-[#B0E4CC]/60"
        placeholder="Search stickers"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {error ? (
        <p className="text-xs text-[#FFD4D4]">{error}</p>
      ) : (
        <p className="text-xs text-[#B0E4CC]/75">
          {debouncedQuery ? "Sticker search results" : "Trending stickers"}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-md border border-[#408A71]/50 bg-[#285A48]/50 p-3 text-xs text-[#B0E4CC]/80">
          Loading stickers...
        </div>
      ) : null}

      <div className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto rounded-md border border-[#408A71]/50 bg-[#285A48]/70 p-2">
        {results.map((sticker) => {
          const selectUrl = sticker.url || sticker.previewUrl;
          const preview = sticker.previewUrl || sticker.url;

          return (
            <button
              key={`${sticker.id}-${preview}`}
              type="button"
              onClick={() => onSelect(selectUrl)}
              className="rounded border border-[#408A71]/60 bg-[#091413]/45 p-2 hover:border-[#B0E4CC]"
              title={sticker.title || "Sticker"}
              disabled={!selectUrl}
            >
              <img src={preview} alt={sticker.title || "Sticker"} className="h-12 w-12 object-contain" />
            </button>
          );
        })}
      </div>

      {!isLoading && !error && results.length === 0 ? (
        <p className="text-xs text-[#B0E4CC]/80">No stickers found for this search.</p>
      ) : null}

      {canLoadMore ? (
        <button
          type="button"
          onClick={() => {
            void load(nextCursor, true);
          }}
          className="w-full rounded border border-[#408A71]/70 bg-[#091413]/55 px-3 py-2 text-xs font-semibold text-[#B0E4CC] hover:bg-[#091413]"
        >
          {isLoadingMore ? "Loading more..." : "Load more stickers"}
        </button>
      ) : null}
    </div>
  );
}

