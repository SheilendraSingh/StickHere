import "dotenv/config";
import http from "http";
import mongoose from "mongoose";
import app from "./app.js";
import connectDB from "./config/db.js";
import createSocketServer from "./config/socket.js";
import initializeSocketLayer from "./sockets/index.js";

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];
const io = createSocketServer(server, allowedOrigins);

initializeSocketLayer(io, { namespace: "/chat" });

server.on("error", (error) => {
  console.error("Server error:", error);
});

await connectDB();

const httpServer = server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down...`);

  try {
    httpServer.close(async () => {
      try {
        await mongoose.connection.close();
        console.log("HTTP server closed and MongoDB disconnected.");
        process.exit(0);
      } catch (error) {
        console.error("Shutdown error:", error.message);
        process.exit(1);
      }
    });
  } catch (error) {
    console.error("Shutdown error:", error.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
