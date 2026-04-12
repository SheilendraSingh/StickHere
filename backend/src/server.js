import "dotenv/config";
import http from "http";
import app from "./app.js";
import jwt from "jsonwebtoken";
import connectDB from "./config/db.js";
import createSocketServer from "./config/socket.js";
import mongoose from "mongoose";

// Set the port from environment variable or default to 5000
const PORT = process.env.PORT || 5000;

// Create HTTP server using the Express app
const server = http.createServer(app);

// Define allowed origins for CORS
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:3000"];

// Create a new Socket.IO server and configure CORS settings
const io = createSocketServer(server, allowedOrigins);
// Map to store online users and their corresponding socket IDs
const onlineUsers = new Map();

// Create a namespace for chat-related Socket.IO events, This allows us to organize our Socket.IO events and separate them from other potential namespaces we might have in the future. By using a namespace, we can ensure that only clients connected to the "/chat" namespace will receive and emit events related to chat functionality, which helps keep our code organized and maintainable.
const chatNamespace = io.of("/chat");

// Function to emit the list of online users to all connected clients, The emitOnlineUsers function is responsible for sending the current list of online users to all connected clients. It uses Socket.IO's emit method to send an "online_users" event along with an array of user IDs (extracted from the onlineUsers map) to all clients. This allows clients to update their user interface with the current list of online users in real-time.
const emitOnlineUsers = () => {
  chatNamespace.emit("online_users", Array.from(onlineUsers.keys()));
};

// Function to add a user to the online users map, The addOnlineUser function is responsible for adding a user to the onlineUsers map. It takes a userId and a socketId as parameters. If the userId is not already present in the onlineUsers map, it creates a new entry with the userId as the key and a new Set to store socket IDs as the value. Then, it adds the provided socketId to the Set associated with that userId. This allows us to keep track of multiple socket connections for a single user, which can be useful if a user is connected from multiple devices or browser tabs.
const addOnlineUser = (userId, socketId) => {
  if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
  onlineUsers.get(userId).add(socketId);
};

// Function to remove a user's socket ID from the online users map, The removeOnlineUserSocket function is responsible for removing a user's socket ID from the onlineUsers map. It takes a userId and a socketId as parameters. It first checks if there are any socket IDs associated with the given userId in the onlineUsers map. If there are, it removes the specified socketId from the Set of socket IDs for that userId. If, after removing the socketId, the Set of socket IDs for that userId is empty, it means that the user has no active connections, and we can safely remove the userId from the onlineUsers map entirely. This helps us maintain an accurate list of online users and their active connections.
const removeOnlineUserSocket = (userId, socketId) => {
  // Check if there are any socket IDs associated with the given userId in the onlineUsers map. If there are, remove the specified socketId from the Set of socket IDs for that userId. If, after removing the socketId, the Set of socket IDs for that userId is empty, it means that the user has no active connections, and we can safely remove the userId from the onlineUsers map entirely. This helps us maintain an accurate list of online users and their active connections.
  const userSockets = onlineUsers.get(userId);

  // If there are no socket IDs associated with the given userId, return early to avoid errors when trying to delete a socketId from an undefined Set.
  if (!userSockets) return;

  // Remove the specified socketId from the Set of socket IDs for that userId. If, after removing the socketId, the Set of socket IDs for that userId is empty, it means that the user has no active connections, and we can safely remove the userId from the onlineUsers map entirely. This helps us maintain an accurate list of online users and their active connections.
  userSockets.delete(socketId);

  // If, after removing the socketId, the Set of socket IDs for that userId is empty, it means that the user has no active connections, and we can safely remove the userId from the onlineUsers map entirely. This helps us maintain an accurate list of online users and their active connections.
  if (userSockets.size === 0) onlineUsers.delete(userId);
};

// Middleware to authenticate Socket.IO connections using JWT, This middleware function is used to authenticate incoming Socket.IO connections to the "/chat" namespace. It checks for the presence of a JWT token in the handshake authentication data, verifies the token using the secret key, and extracts the userId from the decoded token. If the token is valid and contains a userId, it attaches the userId to the socket object for later use in event handlers. If any step of the authentication process fails (e.g., missing token, invalid token, missing userId), it calls next with an error to reject the connection and prevent unauthorized access to the chat functionality.
chatNamespace.use((socket, next) => {
  try {
    // Check for the presence of a JWT token in the handshake authentication data. If the token is missing, return an error to reject the connection and prevent unauthorized access to the chat functionality.
    const token = socket.handshake.auth?.token;

    // If the token is missing, return an error to reject the connection and prevent unauthorized access to the chat functionality.
    if (!token) return next(new Error("Unauthorized"));

    // Verify the token using the secret key, and extract the userId from the decoded token. If the token is invalid or does not contain a userId, return an error to reject the connection and prevent unauthorized access to the chat functionality.
    if (!process.env.JWT_SECRET) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If the token is invalid or does not contain a userId, return an error to reject the connection and prevent unauthorized access to the chat functionality.
    if (!decoded?.userId) {
      return next(new Error("Unauthorized"));
    }

    // If the token is valid and contains a userId, attach the userId to the socket object for later use in event handlers. This allows us to identify the user associated with each socket connection and manage their interactions within the chat application accordingly.
    socket.userId = decoded.userId;

    return next();
  } catch (error) {
    // Log any errors that occur during the authentication process to the console, including the error message and a timestamp. This helps us identify and troubleshoot issues related to socket authentication in our application.
    console.error("Socket Auth Error:", {
      message: error.message,
      time: new Date(),
    });

    // If any step of the authentication process fails (e.g., missing token, invalid token, missing userId), call next with an error to reject the connection and prevent unauthorized access to the chat functionality.
    return next(new Error("Unauthorized"));
  }
});

// Handle Socket.IO connections
chatNamespace.on("connection", (socket) => {
  // Log a message when a new user connects to the Socket.IO server
  console.log(`New User connected to /chat: ${socket.id}`);

  // Log the current number of connected sockets in the /chat namespace, This allows us to keep track of how many users are currently connected to the chat functionality of our application. By logging the number of connected sockets, we can monitor the usage and performance of our chat server in real-time.
  console.log("Connected sockets:", chatNamespace.sockets.size);

  // Handle user joining the app and store their socket ID, When a user joins the app, we expect to receive their userId. We then store this userId along with their socket ID in the onlineUsers map. This allows us to keep track of which users are currently online and their corresponding socket connections.
  socket.on("join_app", () => {
    // Check if the userId is provided, if not, return early
    if (!socket.userId) return;

    // Add the user to the onlineUsers map using their userId and socket ID
    addOnlineUser(socket.userId, socket.id);

    // Emit the updated list of online users to all connected clients
    emitOnlineUsers();

    // Log the user joining the app
    console.log(`User joined app: ${socket.userId}`);
  });

  // Handle user joining a specific room, When a user wants to join a specific chat room, we listen for the "join_room" event. The client should send the name of the room they want to join. We then use Socket.IO's join method to add the user's socket to that room. This allows us to manage group chats and send messages to all users in that room.
  //chat room like world / india / india-rajasthan / india-rajasthan-kota
  socket.on("join_room", ({ roomName } = {}) => {
    // Check if the roomName is provided, if not, return early
    if (!roomName) return;

    // Use Socket.IO's join method to add the socket to the specified room
    socket.join(roomName);

    // Log the user joining the room
    console.log(`User ${socket.userId} joined ${roomName}`);

    // Emit a "room_joined" event back to the client that joined the room, This allows the client to confirm that they have successfully joined the specified chat room. The server sends back the room name in the payload, which can be used by the client to update its user interface or perform any necessary actions related to joining the room.
    socket.emit("room_joined", { roomName });

    // Notify other users in the room that a user has joined, After a user joins a specific room, we emit a "user_joined" event to all other users in that room using Socket.IO's to method. This allows us to notify other users in the chat room that a new user has joined, which can be used to update the user interface or show a notification to other users.
    socket.to(roomName).emit("user_joined", {
      userId: socket.userId,
    });
  });

  //leave room
  socket.on("leave_room", ({ roomName } = {}) => {
    // Check if the roomName is provided, if not, return early
    if (!roomName) return;

    // Use Socket.IO's leave method to remove the socket from the specified room
    socket.leave(roomName);

    // Log the user leaving the room
    console.log(`User ${socket.userId} left ${roomName}`);

    // Emit a "room_left" event back to the client that left the room, This allows the client to confirm that they have successfully left the specified chat room. The server sends back the room name in the payload, which can be used by the client to update its user interface or perform any necessary actions related to leaving the room.
    socket.emit("room_left", { roomName });

    // Notify other users in the room that a user has left, After a user leaves a specific room, we emit a "user_left" event to all other users in that room using Socket.IO's to method. This allows us to notify other users in the chat room that a user has left, which can be used to update the user interface or show a notification to other users.
    socket.to(roomName).emit("user_left", {
      userId: socket.userId,
    });
  });

  //Send message to a specific room, When a user sends a message to a specific room, we listen for the "send_message" event. The client should send the room name and the message content. We then use Socket.IO's to method to emit the message to all users in that room. This allows for real-time communication within specific chat rooms.
  socket.on("send_message", (messageData = {}) => {
    // Destructure the messageData object to extract roomName, text, attachments, and messageType
    const { roomName, text, attachments, messageType } = messageData;

    // Check if the roomName and message are provided, if not, return early
    if (!roomName) return;

    // prevent sending to rooms this socket never joined
    if (!socket.rooms.has(roomName)) {
      // Log a warning message if the socket is trying to send a message to a room it has not joined, and return early to prevent sending the message
      console.warn(
        `Blocked message from ${socket.id} to unjoined room: ${roomName}`,
      );
      return;
    }

    // Check if the socket has an associated userId, if not, return early to prevent sending messages from unidentified users
    if (!socket.userId) return;

    // Check if the message has text or attachments, if not, return early to prevent sending empty messages
    const hasText = typeof text === "string" && text.trim().length > 0;
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    // If the message does not contain text or attachments, return early to prevent sending empty messages
    if (!hasText && !hasAttachments) {
      console.warn(`Blocked empty message from ${socket.userId}`);
      return;
    }

    // Create a payload object containing the message details, including senderId, roomName, text, messageType, attachments, and createdAt timestamp
    const payload = {
      senderId: socket.userId,
      roomName,
      text: text || "",
      messageType: messageType || "text",
      attachments: hasAttachments ? attachments : [],
      createdAt: new Date(),
    };

    // Use Socket.IO's to method to emit the message to all users in the specified room
    chatNamespace.to(roomName).emit("receive_message", payload);

    // Log the message being sent to the room
    console.log(`Message sent to ${roomName}`);
  });

  //typing indicator, When a user is typing a message in a specific room, we listen for the "typing" event. The client should send the room name and a boolean indicating whether the user is currently typing. We then emit this information to all other users in that room using Socket.IO's to method. This allows us to show a typing indicator to other users in the chat room when someone is typing a message.
  socket.on("typing", ({ roomName, name } = {}) => {
    // Check if the roomName is provided, if not, return early
    if (!roomName) return;

    // prevent sending to rooms this socket never joined
    if (!socket.rooms.has(roomName)) return;

    // Check if the socket has an associated userId, if not, return early to prevent emitting typing status for unidentified users
    if (!socket.userId) return;

    // Emit the typing status to all other users in the specified room
    socket.to(roomName).emit("typing", {
      userId: socket.userId,
      name,
    });
  });

  socket.on("stop_typing", ({ roomName } = {}) => {
    // Check if the roomName is provided, if not, return early
    if (!roomName) return;

    // prevent sending to rooms this socket never joined
    if (!socket.rooms.has(roomName)) return;

    // Check if the socket has an associated userId, if not, return early to prevent emitting stop typing status for unidentified users
    if (!socket.userId) return;

    // Emit the stop typing status to all other users in the specified room
    socket.to(roomName).emit("stop_typing", {
      userId: socket.userId,
    });
  });

  // Handle disconnection of users
  socket.on("disconnect", () => {
    // Check if the socket has an associated userId, if so, remove it from the onlineUsers map and emit the updated list of online users to all clients
    if (socket.userId) {
      // Remove the user from the onlineUsers map using their userId
      removeOnlineUserSocket(socket.userId, socket.id);

      // Emit the updated list of online users to all connected clients
      emitOnlineUsers();

      // Log the user disconnection
      console.log(`User disconnected: ${socket.userId}`);
    }

    // Log the socket disconnection
    console.log(`Socket disconnected: ${socket.id}`);
    console.log("Connected sockets:", chatNamespace.sockets.size);
  });
});

// Handle server errors
server.on("error", (error) => {
  // Log any server errors to the console
  console.error("Server error:", error);
});

// Connect to the MongoDB database before starting the server, This ensures that our application has a successful connection to the database before it starts accepting incoming requests. If the database connection fails, we can log the error and prevent the server from starting, which helps maintain the stability and reliability of our application.
await connectDB();

// Start the server and listen on the specified port, When the server starts successfully, we log a message to the console indicating that the server is running and listening on the specified port. This provides feedback to developers and monitoring tools that the backend API is up and running, allowing them to verify that the server is operational and ready to handle incoming requests.
const httpServer = server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown function to close the server and database connection when the application is terminated, This function is responsible for gracefully shutting down the server and closing the MongoDB connection when the application receives a termination signal (e.g., SIGINT or SIGTERM). It ensures that all ongoing requests are completed before shutting down the server and disconnecting from the database, which helps prevent data loss and maintain the integrity of our application during shutdown.
const shutdown = async (signal) => {
  // Log a message indicating that a shutdown signal has been received, and that the server is shutting down. This provides feedback to developers and monitoring tools that the application is in the process of shutting down, allowing them to take appropriate actions if necessary.
  console.log(`${signal} received. Shutting down...`);

  // Attempt to close the HTTP server and disconnect from MongoDB gracefully. If any errors occur during the shutdown process, log the error message to the console and exit the process with a non-zero status code to indicate that the shutdown was not successful.
  try {
    httpServer.close(async () => {
      await mongoose.connection.close();
      console.log("HTTP server closed and MongoDB disconnected.");
      process.exit(0);
    });
  } catch (err) {
    console.error("Shutdown error:", err.message);
    process.exit(1);
  }
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
