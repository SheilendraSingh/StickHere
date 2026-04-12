import type { Room } from "@/types/room";

export default function ChatHeader({ room }: { room: Room | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-zinc-500">Room</p>
        <h1 className="truncate text-lg font-semibold text-zinc-900">
          {room?.displayName || "Select a room"}
        </h1>
      </div>
      <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
        StickHere
      </span>
    </header>
  );
}
