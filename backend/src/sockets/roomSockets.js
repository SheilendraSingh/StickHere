
export const registerRoomSocketHandlers = (socket) => {
  socket.on("join_room", ({ roomName } = {}) => {
    if (!roomName) return;

    socket.join(roomName);
    console.log(`User ${socket.userId} joined ${roomName}`);

    socket.emit("room_joined", { roomName });
    socket.to(roomName).emit("user_joined", { userId: socket.userId });
  });

  socket.on("leave_room", ({ roomName } = {}) => {
    if (!roomName) return;

    socket.leave(roomName);
    console.log(`User ${socket.userId} left ${roomName}`);

    socket.emit("room_left", { roomName });
    socket.to(roomName).emit("user_left", { userId: socket.userId });
  });
};

export default registerRoomSocketHandlers;
