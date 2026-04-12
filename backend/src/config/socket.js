import { Server } from "socket.io";

const getAllowedOrigins = () => [
  process.env.FRONTEND_URL || "http://localhost:3000",
];

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
