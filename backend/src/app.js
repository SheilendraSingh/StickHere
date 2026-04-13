import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import mediaRoutes from "./routes/mediaRoutes.js";
import gifRoutes from "./routes/gifRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { getAllowedOrigins, isAllowedOrigin } from "./config/allowedOrigins.js";
// Create an Express application instance to set up our server and define routes for handling incoming HTTP requests. This app will serve as the main entry point for our backend API, allowing us to define endpoints for various functionalities such as user authentication, chat management, and more.
const app = express();

// Define an array of allowed origins for CORS (Cross-Origin Resource Sharing) to specify which frontend applications are permitted to access our backend API. This helps enhance security by restricting access to only trusted sources, preventing unauthorized cross-origin requests that could potentially lead to security vulnerabilities.
const allowedOrigins = getAllowedOrigins();

// Use the CORS middleware to enable cross-origin requests from the specified allowed origins, allowing our frontend applications to communicate with the backend API while ensuring that only authorized sources can access our resources. This is essential for enabling seamless integration between the frontend and backend components of our chat application.
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin not allowed"));
    },
    credentials: true,
  }),
);

// Use the built-in Express middleware to parse incoming JSON payloads in the request body, allowing us to easily access and manipulate data sent from the frontend applications. This is crucial for handling various API requests such as user registration, login, message sending, and more, where we need to process and respond to JSON data effectively.
app.use(express.json({ limit: "10mb" }));

// Use the built-in Express middleware to parse URL-encoded data in the request body, allowing us to handle form submissions and other types of data sent from the frontend applications. This is important for processing various API requests that may include URL-encoded data, ensuring that we can access and utilize this information effectively in our backend logic.
app.use(express.urlencoded({ extended: true }));

// Use the authRoutes router to handle all routes related to user authentication and profile management under the "/api/auth" path. This allows us to organize our authentication-related routes in a modular way, improving code organization and maintainability while providing a clear structure for handling user registration, login, logout, and profile management functionalities in our backend API.
app.use("/api/auth", authRoutes);

app.use("/api/rooms", roomRoutes);

app.use("/api/messages", messageRoutes);

app.use("/api/media", mediaRoutes);

app.use("/api/gifs", gifRoutes);

app.use("/api/users", userRoutes);

app.use("/api/uploads", uploadRoutes);

// Define a simple route for the root URL ("/") to respond with a JSON message indicating that the Chat API is running. This serves as a basic health check endpoint to verify that our backend server is up and operational, allowing developers and monitoring tools to quickly confirm the status of the API.
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Chat API is running",
  });
});

// Define a health check endpoint at "/api/health" to respond with a JSON message indicating that the server is healthy. This endpoint can be used by monitoring tools or developers to regularly check the health status of the backend server, ensuring that it is functioning properly and able to handle incoming requests without issues.
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});
export default app;
