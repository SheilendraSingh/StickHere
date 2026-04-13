import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getGifCategories,
  getTrendingGifs,
  getTrendingStickers,
  searchGifs,
  searchStickers,
} from "../controllers/gifController.js";

const router = express.Router();

router.get("/search", authMiddleware, searchGifs);
router.get("/trending", authMiddleware, getTrendingGifs);
router.get("/categories", authMiddleware, getGifCategories);
router.get("/stickers/search", authMiddleware, searchStickers);
router.get("/stickers/trending", authMiddleware, getTrendingStickers);

export default router;
