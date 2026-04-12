export default function TypingIndicator({ users }: { users: string[] }) {
  if (users.length === 0) return null;

  const label = users.length === 1 ? `${users[0]} is typing...` : "People are typing...";
  return <p className="px-4 pb-2 text-xs text-[#B0E4CC]/75">{label}</p>;
}
