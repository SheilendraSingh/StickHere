
export const registerMessageSocketHandlers = (socket, helpers = {}) => {
  const { chatNamespace } = helpers;

  socket.on("send_message", (messageData = {}) => {
    const { roomName, text, attachments, messageType } = messageData;
    if (!roomName) return;

    if (!socket.rooms.has(roomName)) {
      console.warn(
        `Blocked message from ${socket.id} to unjoined room: ${roomName}`,
      );
      return;
    }

    if (!socket.userId) return;

    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
    if (!hasText && !hasAttachments) {
      console.warn(`Blocked empty message from ${socket.userId}`);
      return;
    }

    const payload = {
      senderId: socket.userId,
      roomName,
      text: text || "",
      messageType: messageType || "text",
      attachments: hasAttachments ? attachments : [],
      createdAt: new Date(),
    };

    if (chatNamespace) {
      chatNamespace.to(roomName).emit("receive_message", payload);
    } else {
      socket.to(roomName).emit("receive_message", payload);
      socket.emit("receive_message", payload);
    }
    console.log(`Message sent to ${roomName}`);
  });

  socket.on("typing", ({ roomName, name } = {}) => {
    if (!roomName || !socket.userId) return;
    if (!socket.rooms.has(roomName)) return;

    socket.to(roomName).emit("typing", {
      userId: socket.userId,
      name,
    });
  });

  socket.on("stop_typing", ({ roomName } = {}) => {
    if (!roomName || !socket.userId) return;
    if (!socket.rooms.has(roomName)) return;

    socket.to(roomName).emit("stop_typing", {
      userId: socket.userId,
    });
  });
};

export default registerMessageSocketHandlers;
