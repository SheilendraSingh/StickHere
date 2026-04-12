import type { User } from "@/types/user";

export default function OnlineUsers({ users }: { users: User[] }) {
  return (
    <div className="hidden border-l border-zinc-200 bg-white p-3 lg:block lg:w-56">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Online ({users.length})
      </h3>
      <ul className="space-y-2">
        {users.map((user) => (
          <li key={user._id} className="truncate text-sm text-zinc-700">
            {user.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
