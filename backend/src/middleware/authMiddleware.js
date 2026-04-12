import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware function to protect routes by verifying the JWT token provided in the request headers. This function checks for the presence of an Authorization header, extracts the token, and verifies it using the secret key defined in the environment variables. If the token is valid, it retrieves the user associated with the token's payload and attaches it to the request object for use in subsequent middleware or route handlers. If the token is missing or invalid, it responds with a 401 Unauthorized status and an appropriate error message, ensuring that only authenticated users can access protected routes in the application.
const authMiddleware = async (req, res, next) => {
  try {
    // Check for the presence of the Authorization header and ensure it starts with "Bearer ". If the header is missing or does not follow the expected format, respond with a 401 Unauthorized status and an appropriate error message to indicate that the authorization token is missing. This helps ensure that only requests with a valid token can access protected routes in the application.
    const authHeader = req.headers.authorization;

    // If the Authorization header is missing or does not start with "Bearer ", respond with a 401 Unauthorized status and an appropriate error message to indicate that the authorization token is missing. This helps ensure that only requests with a valid token can access protected routes in the application.
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Authorization token missing" });
    }

    // Extract the token from the Authorization header by splitting the header value and taking the second part (the token). This token will be used for verification to ensure that the request is authenticated and authorized to access protected resources in the application.
    const token = authHeader.split(" ")[1];
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "Server configuration error",
      });
    }

    // Verify the token using the jsonwebtoken library and the secret key defined in the environment variables. If the token is valid, it will decode the payload and allow us to retrieve the user ID from it. If the token is invalid or expired, it will throw an error that we can catch and respond with a 401 Unauthorized status and an appropriate error message to indicate that the token is invalid or expired. This helps ensure that only authenticated requests with valid tokens can access protected routes in the application.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded?.userId) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token",
      });
    }

    // Retrieve the user associated with the token's payload (user ID) from the database, excluding the password field for security reasons. If the user is not found, respond with a 401 Unauthorized status and an appropriate error message to indicate that the user was not found. If the user is found, attach the user ID and user object to the request object for use in subsequent middleware or route handlers, allowing them to access the authenticated user's information as needed.
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Attach the user ID and user object to the request object for use in subsequent middleware or route handlers, allowing them to access the authenticated user's information as needed. This helps ensure that authenticated requests can access the necessary user information to perform actions on behalf of the user while maintaining security by not exposing sensitive information such as the password.
    req.userId = user._id.toString();
    req.user = user;

    return next();
  } catch (error) {
    console.error("Authentication error", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
export default authMiddleware;
