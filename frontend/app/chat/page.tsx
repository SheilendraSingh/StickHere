import ProtectedRoute from "@/components/layout/ProtectedRoute";
import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatPage() {
  return (
    <ProtectedRoute>
      <ChatLayout />
    </ProtectedRoute>
  );
}
