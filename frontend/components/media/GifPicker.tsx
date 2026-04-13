"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTrendingGifs,
  searchGifs,
  type GifItem,
} from "@/services/gifService";

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

const fallbackGifs: GifItem[] = [
  {
    id: "fallback-1",
    title: "Thumbs up",
    url: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDNuOHhlcnF0czQ2YTFjM2I5c3h0dGtza3QxZXJodnZnMHl3bWlmZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif",
    previewUrl:
      "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExdDNuOHhlcnF0czQ2YTFjM2I5c3h0dGtza3QxZXJodnZnMHl3bWlmZCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ICOgUNjpvO0PC/giphy.gif",
    width: 0,
    height: 0,
    durationSeconds: 0,
    tags: [],
  },
  {
    id: "fallback-2",
    title: "Celebration",
    url: "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTZ0NW9pbnB4N2I4a3h5ZmVvNG5rbGd0MHNpdXF5OG14MHEzOGZjdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKTDn976rzVgky4/giphy.gif",
    previewUrl:
      "https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTZ0NW9pbnB4N2I4a3h5ZmVvNG5rbGd0MHNpdXF5OG14MHEzOGZjdyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKTDn976rzVgky4/giphy.gif",
    width: 0,
    height: 0,
    durationSeconds: 0,
    tags: [],
  },
  {
    id: "fallback-3",
    title: "Happy",
    url: "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2p6bXQ4dnN4dTVqenR4enVjYnd6MXQ0YW42YW95d2VjMGswaGRzYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlBO7eyXzSZkJri/giphy.gif",
    previewUrl:
      "https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExc2p6bXQ4dnN4dTVqenR4enVjYnd6MXQ0YW42YW95d2VjMGswaGRzYSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0HlBO7eyXzSZkJri/giphy.gif",
    width: 0,
    height: 0,
    durationSeconds: 0,
    tags: [],
  },
];

export default function GifPicker({ onSelect }: GifPickerProps) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<GifItem[]>(fallbackGifs);
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
          ? await searchGifs(debouncedQuery, { pos: cursor, limit: 24 })
          : await getTrendingGifs({ pos: cursor, limit: 24 });

        setResults((prev) => (append ? [...prev, ...payload.results] : payload.results));
        setNextCursor(payload.next || "");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load GIFs";
        setError(message);
        if (!append) {
          setResults(isSearch ? [] : fallbackGifs);
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
        placeholder="Search GIFs"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {error ? (
        <p className="text-xs text-[#FFD4D4]">{error}</p>
      ) : (
        <p className="text-xs text-[#B0E4CC]/75">
          {debouncedQuery ? "Search results" : "Trending GIFs"}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-md border border-[#408A71]/50 bg-[#285A48]/50 p-3 text-xs text-[#B0E4CC]/80">
          Loading GIFs...
        </div>
      ) : null}

      <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto rounded-md border border-[#408A71]/50 bg-[#285A48]/70 p-2">
        {results.map((gif) => {
          const selectUrl = gif.url || gif.previewUrl;
          const preview = gif.previewUrl || gif.url;

          return (
            <button
              key={`${gif.id}-${preview}`}
              type="button"
              onClick={() => onSelect(selectUrl)}
              className="overflow-hidden rounded border border-[#408A71]/60 hover:border-[#B0E4CC]"
              title={gif.title || "GIF"}
              disabled={!selectUrl}
            >
              <img src={preview} alt={gif.title || "GIF option"} className="h-24 w-full object-cover" />
            </button>
          );
        })}
      </div>

      {!isLoading && !error && results.length === 0 ? (
        <p className="text-xs text-[#B0E4CC]/80">No GIFs found for this search.</p>
      ) : null}

      {canLoadMore ? (
        <button
          type="button"
          onClick={() => {
            void load(nextCursor, true);
          }}
          className="w-full rounded border border-[#408A71]/70 bg-[#091413]/55 px-3 py-2 text-xs font-semibold text-[#B0E4CC] hover:bg-[#091413]"
        >
          {isLoadingMore ? "Loading more..." : "Load more GIFs"}
        </button>
      ) : null}
    </div>
  );
}

