
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { generalApiLimiter } from "../middleware/rateLimitMiddleware.js";
import {
  getMyProfile,
  getOnlineUsers,
  getUserProfileById,
  searchUsers,
  updateMyPresence,
} from "../controllers/userController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(generalApiLimiter);

router.get("/me", getMyProfile);
router.patch("/me/presence", updateMyPresence);
router.get("/online", getOnlineUsers);
router.get("/search", searchUsers);
router.get("/:userId", getUserProfileById);

export default router;
