
export const registerPresenceSocketHandlers = (socket, helpers = {}) => {
  const { addOnlineUser, emitOnlineUsers } = helpers;

  socket.on("join_app", () => {
    if (!socket.userId) return;
    if (typeof addOnlineUser === "function") {
      addOnlineUser(socket.userId, socket.id);
    }
    if (typeof emitOnlineUsers === "function") {
      emitOnlineUsers();
    }
    console.log(`User joined app: ${socket.userId}`);
  });
};

export default registerPresenceSocketHandlers;
