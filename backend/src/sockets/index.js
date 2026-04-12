
import jwt from "jsonwebtoken";
import registerMessageSocketHandlers from "./messageSockets.js";
import registerPresenceSocketHandlers from "./presenceSockets.js";
import registerRoomSocketHandlers from "./roomSockets.js";

const resolveSocketToken = (socket) => {
  if (socket.handshake?.auth?.token) return socket.handshake.auth.token;

  const authHeader = socket.handshake?.headers?.authorization;
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return "";
};

const createSocketAuthMiddleware = () => (socket, next) => {
  try {
    const token = resolveSocketToken(socket);
    if (!token || !process.env.JWT_SECRET) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return next(new Error("Unauthorized"));
    }

    socket.userId = decoded.userId;
    return next();
  } catch (error) {
    console.error("Socket Auth Error:", {
      message: error.message,
      time: new Date(),
    });
    return next(new Error("Unauthorized"));
  }
};

export const initializeSocketLayer = (io, options = {}) => {
  const namespace = options.namespace || "/chat";
  const chatNamespace = io.of(namespace);
  const onlineUsers = new Map();

  const emitOnlineUsers = () => {
    chatNamespace.emit("online_users", Array.from(onlineUsers.keys()));
  };

  const addOnlineUser = (userId, socketId) => {
    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socketId);
  };

  const removeOnlineUserSocket = (userId, socketId) => {
    const userSockets = onlineUsers.get(userId);
    if (!userSockets) return;

    userSockets.delete(socketId);
    if (userSockets.size === 0) {
      onlineUsers.delete(userId);
    }
  };

  chatNamespace.use(createSocketAuthMiddleware());

  chatNamespace.on("connection", (socket) => {
    console.log(`New user connected to ${namespace}: ${socket.id}`);
    console.log("Connected sockets:", chatNamespace.sockets.size);

    registerPresenceSocketHandlers(socket, {
      addOnlineUser,
      emitOnlineUsers,
    });
    registerRoomSocketHandlers(socket, {
      chatNamespace,
    });
    registerMessageSocketHandlers(socket, {
      chatNamespace,
    });

    socket.on("disconnect", () => {
      if (socket.userId) {
        removeOnlineUserSocket(socket.userId, socket.id);
        emitOnlineUsers();
        console.log(`User disconnected: ${socket.userId}`);
      }

      console.log(`Socket disconnected: ${socket.id}`);
      console.log("Connected sockets:", chatNamespace.sockets.size);
    });
  });

  return {
    chatNamespace,
    onlineUsers,
    emitOnlineUsers,
  };
};

export default initializeSocketLayer;
