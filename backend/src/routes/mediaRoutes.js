
import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  deleteMedia,
  getUploadSignature,
  uploadMedia,
} from "../controllers/mediaController.js";

const router = express.Router();

router.post("/upload", authMiddleware, uploadMedia);
router.post("/signature", authMiddleware, getUploadSignature);
router.delete("/", authMiddleware, deleteMedia);
router.delete("/:publicId", authMiddleware, deleteMedia);

export default router;
