import express from "express";
import {
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
  updateUserProfile,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

// Create an Express router instance to define routes related to user authentication and profile management. This router will handle endpoints for user registration, login, logout, and profile retrieval and updates, allowing us to organize our authentication-related routes in a modular way. By using this router, we can easily manage and maintain the authentication logic separately from other parts of the application, improving code organization and readability.
const router = express.Router();

// Define routes for user registration, login, logout, and profile management. The registration and login routes are public and do not require authentication, while the logout and profile routes are protected by the authMiddleware to ensure that only authenticated users can access them. This setup allows us to securely manage user authentication and profile information while providing a clear separation of concerns in our route definitions.
router.post("/register", registerUser);
router.post("/login", loginUser);

// The logout and profile routes are protected by the authMiddleware to ensure that only authenticated users can access them. This helps maintain the security of the application by preventing unauthorized access to sensitive user information and actions, such as logging out or updating profile details. By applying the authMiddleware to these routes, we can ensure that only users with valid authentication tokens can perform these actions, enhancing the overall security of our backend API.
router.post("/logout", authMiddleware, logoutUser);
router.get("/profile", authMiddleware, getUserProfile);
router.put("/profile", authMiddleware, updateUserProfile);

export default router;
