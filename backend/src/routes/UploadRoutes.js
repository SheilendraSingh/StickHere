import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { mediaUploadRateLimiter } from "../middleware/rateLimitMiddleware.js";
import {
  uploadMultipleMedia,
  uploadSingleMedia,
} from "../middleware/uploadMiddleware.js";
import {
  deleteUploadedFile,
  getUploadSignature,
  uploadMultiple,
  uploadSingle,
} from "../controllers/uploadController.js";

const router = express.Router();

router.use(authMiddleware);
router.use(mediaUploadRateLimiter);

router.post("/single", uploadSingleMedia, uploadSingle);
router.post("/multiple", uploadMultipleMedia, uploadMultiple);
router.post("/signature", getUploadSignature);
router.delete("/", deleteUploadedFile);
router.delete("/:publicId", deleteUploadedFile);

export default router;
