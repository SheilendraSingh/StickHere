import type { Room } from "@/types/room";

export default function ChatHeader({ room }: { room: Room | null }) {
  return (
    <header className="flex h-16 items-center justify-between border-b border-[#408A71]/45 bg-[#285A48] px-4">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-[#B0E4CC]/80">Room</p>
        <h1 className="truncate text-lg font-semibold text-[#B0E4CC]">
          {room?.displayName || "Select a room"}
        </h1>
      </div>
      <span className="rounded-full border border-[#408A71] bg-[#091413]/65 px-3 py-1 text-xs font-semibold text-[#B0E4CC]">
        StickHere
      </span>
    </header>
  );
}
