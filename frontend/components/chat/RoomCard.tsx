import type { Room } from "@/types/room";

interface RoomCardProps {
  room: Room;
  isActive: boolean;
  onClick: (room: Room) => void;
}

export default function RoomCard({ room, isActive, onClick }: RoomCardProps) {
  return (
    <button
      className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
        isActive
          ? "border border-[#B0E4CC]/40 bg-[#408A71] text-[#B0E4CC]"
          : "text-[#B0E4CC]/90 hover:bg-[#408A71]/30 hover:text-[#B0E4CC]"
      }`}
      onClick={() => onClick(room)}
      type="button"
    >
      <p className="font-semibold">{room.displayName}</p>
      <p className="text-xs opacity-75">#{room.roomName}</p>
    </button>
  );
}
