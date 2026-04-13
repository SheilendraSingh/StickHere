import {
  GifServiceError,
  getGifCategoriesService,
  getTrendingGifsService,
  getTrendingStickersService,
  searchGifsService,
  searchStickersService,
} from "../services/gifServices.js";

const respondWithGifError = (res, error, fallbackMessage) => {
  if (error instanceof GifServiceError) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || fallbackMessage,
      ...(process.env.NODE_ENV !== "production" && error.details
        ? { details: error.details }
        : {}),
    });
  }

  console.error(fallbackMessage, error?.message || error);
  return res.status(500).json({
    success: false,
    message: fallbackMessage,
  });
};

export const searchGifs = async (req, res) => {
  try {
    const data = await searchGifsService({
      query: req.query?.q,
      limit: req.query?.limit,
      pos: req.query?.pos,
      locale: req.query?.locale,
      contentFilter: req.query?.contentfilter,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return respondWithGifError(
      res,
      error,
      "Server error while searching GIFs",
    );
  }
};

export const getTrendingGifs = async (req, res) => {
  try {
    const data = await getTrendingGifsService({
      limit: req.query?.limit,
      pos: req.query?.pos,
      locale: req.query?.locale,
      contentFilter: req.query?.contentfilter,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return respondWithGifError(
      res,
      error,
      "Server error while fetching trending GIFs",
    );
  }
};

export const getGifCategories = async (req, res) => {
  try {
    const data = await getGifCategoriesService({
      locale: req.query?.locale,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return respondWithGifError(
      res,
      error,
      "Server error while fetching GIF categories",
    );
  }
};

export const searchStickers = async (req, res) => {
  try {
    const data = await searchStickersService({
      query: req.query?.q,
      limit: req.query?.limit,
      pos: req.query?.pos,
      locale: req.query?.locale,
      contentFilter: req.query?.contentfilter,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return respondWithGifError(
      res,
      error,
      "Server error while searching stickers",
    );
  }
};

export const getTrendingStickers = async (req, res) => {
  try {
    const data = await getTrendingStickersService({
      limit: req.query?.limit,
      pos: req.query?.pos,
      locale: req.query?.locale,
      contentFilter: req.query?.contentfilter,
    });
    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return respondWithGifError(
      res,
      error,
      "Server error while fetching trending stickers",
    );
  }
};
