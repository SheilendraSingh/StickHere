export default function EmptyChatState() {
  return (
    <div className="flex h-full items-center justify-center p-6 text-center">
      <div>
        <h3 className="text-lg font-semibold text-[#B0E4CC]">No messages yet</h3>
        <p className="mt-2 text-sm text-[#B0E4CC]/80">
          Start the conversation by sending your first message.
        </p>
      </div>
    </div>
  );
}
