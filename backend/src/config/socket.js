import { Server } from "socket.io";
import { getAllowedOrigins } from "./allowedOrigins.js";

const createSocketServer = (httpServer, allowedOrigins = getAllowedOrigins()) =>
  new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

export { createSocketServer };
export default createSocketServer;
