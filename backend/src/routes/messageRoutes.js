import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  deleteMessage,
  getRoomMessages,
  sendMessage,
} from "../controllers/messageController.js";

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:roomName", authMiddleware, getRoomMessages);
router.delete("/:messageId", authMiddleware, deleteMessage);

export default router;
