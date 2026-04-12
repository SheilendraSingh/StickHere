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
          ? "bg-sky-100 text-sky-800"
          : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
      }`}
      onClick={() => onClick(room)}
      type="button"
    >
      <p className="font-semibold">{room.displayName}</p>
      <p className="text-xs opacity-75">#{room.roomName}</p>
    </button>
  );
}
