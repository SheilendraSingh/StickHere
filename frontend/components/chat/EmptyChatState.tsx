export default function EmptyChatState() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-zinc-800">No messages yet</h3>
        <p className="mt-2 text-sm text-zinc-500">
          Start the conversation by sending your first message.
        </p>
      </div>
    </div>
  );
}
