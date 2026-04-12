import type { Room } from "@/types/room";
import RoomCard from "@/components/chat/RoomCard";

interface ChatSidebarProps {
  rooms: Room[];
  activeRoom: Room | null;
  onSelectRoom: (room: Room) => void;
  isLoading?: boolean;
}

export default function ChatSidebar({
  rooms,
  activeRoom,
  onSelectRoom,
  isLoading = false,
}: ChatSidebarProps) {
  return (
    <aside className="flex h-full w-full max-w-xs flex-col border-r border-[#408A71]/45 bg-[#285A48]">
      <div className="border-b border-[#408A71]/45 px-4 py-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-[#B0E4CC]/85">
          Rooms
        </h2>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        {isLoading ? (
          <p className="px-1 text-sm text-[#B0E4CC]/80">Loading rooms...</p>
        ) : rooms.length === 0 ? (
          <p className="px-1 text-sm text-[#B0E4CC]/80">No rooms available</p>
        ) : (
          rooms.map((room) => (
            <RoomCard
              key={room.roomName}
              room={room}
              isActive={activeRoom?.roomName === room.roomName}
              onClick={onSelectRoom}
            />
          ))
        )}
      </div>
    </aside>
  );
}
